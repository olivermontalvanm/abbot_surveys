import { FC, useEffect, useState } from "react";
import Modal from "../components/Modal";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../hooks/hooks";
import { createUser as createUserThunk, toggleSnackbar, updateUser as updateUserThunk } from "../store/store";
import TextInput from "../components/inputs/TextInput";
import Select from "../components/inputs/Select";
import { CatalogOption } from "../interfaces/Common";
import { Box } from "@mui/material";
import { User } from "../interfaces/Models";
import { RegexUtils, BizRules } from "../utils/Utils";

const { validateEmail, hasSpaces } = new RegexUtils( );
const { roleRequiresProject } = new BizRules( );

interface UserData {
    id?: number;
    username: string; email: string;
    name: string; lastname: string; selectedRole: CatalogOption | null;
    selectedProjects: CatalogOption[ ]; isActive: boolean;
};

const initialUserData: UserData = {
    username: "", email: "", name: "", lastname: "",
    selectedRole: null, selectedProjects: [ ], isActive: true
};

const UserManageModal: FC<{ 
    opened: boolean; toggler: ( status: boolean ) => void; 
    onUserCreate?: ( ) => void; selectedUser: User | null; onUserUpdate?: ( user: User ) => void;
}> = ( { opened, toggler, onUserCreate, selectedUser, onUserUpdate } ) => {
    const dispatch = useAppDispatch( );

    const { projects, roles } = useSelector( ( state: RootState ) => state.common );
    
    const [ canCreate, setCanCreate ] = useState<boolean>( false );
    const [ userData, setUserData ] = useState<UserData>( initialUserData );
    const [ inputErrors, setInputErrors ] = useState<{ [ key: string ]: string }>( { } );

    useEffect( ( ) => {
        setUserData( selectedUser ? {
            id: selectedUser.id,
            username: selectedUser?.username ?? "",
            email: selectedUser?.email ?? "",
            name: selectedUser?.firstname ?? "",
            lastname: selectedUser?.lastname ?? "",
            selectedRole: selectedUser?.userRole ? { id: selectedUser.userRole.id, label: selectedUser.userRole.title } : null,
            selectedProjects: selectedUser?.projects.length ? selectedUser.projects.map( p => ( { id: p.id, label: p.title } ) ) : [ ],
            isActive: selectedUser?.isActive
        } : initialUserData );
    }, [ selectedUser, opened ] );
    
    const validateFields: ( ) => boolean = ( ) => {
        const { username, email, name, lastname, selectedRole, selectedProjects } = userData;
        
        const errors: typeof inputErrors = { };
        
        if( !username || !email || !name || !lastname )
            return false;

        if( !selectedRole )
            return false;

        if( roleRequiresProject( selectedRole?.label ) && !selectedProjects.length )
            return false;

        if( !validateEmail( email ) ) {
            errors.email = "El correo no es válido";
        }

        if( !hasSpaces( username ) ) {
            errors.username = "No puede contener espacios";
        }

        if( Object.keys( errors ).length ) {
            setInputErrors( prev => ( { ...prev, ...errors } ) );
            return false;
        }

        setInputErrors( errors );

        return true;
    };

    const resetAllFields = ( ) => {
        setUserData( initialUserData );
        setCanCreate( false );
    };

    const handleClose = ( ) => {
        toggler( false );
        resetAllFields( );
    };
    
    const updateField: ( field: keyof UserData, value: string | CatalogOption | CatalogOption[ ] ) => void = ( field, value ) => {
        setUserData( prev => ( { ...prev, [ field ]: value } ) );
    };
    
    useEffect( ( ) => {
        setCanCreate( validateFields( ) );
    }, [ userData ] )

    const handleUserCreate = ( ) => {
        const { username, email, name, lastname, selectedProjects, selectedRole } = userData;
        
        const newUser = {
            username, email, firstname: name,
            lastname, projects: selectedProjects.map( p => p.label ),
            role: selectedRole?.id as number
        };

        dispatch( createUserThunk( newUser ) )
        .then( r => {
            if( r.meta.requestStatus == "fulfilled" ) {
                toggler( false );
                resetAllFields( );

                dispatch( toggleSnackbar( { message: "Usuario creado", type: "success" } ) );

                if( onUserCreate )
                    onUserCreate( );
            }
        } )
        .catch( e => {
            console.error( e );
        } );
    };

    const handleUserUpdate = ( ) => {
        const { id, username, email, name, lastname, selectedProjects, selectedRole } = userData;
        
        const newUser = {
            username, email, firstname: name,
            lastname, projects: selectedProjects.map( p => p.label ),
            roleId: selectedRole?.id, id
        };

        dispatch( updateUserThunk( newUser ) )
        .then( r => {
            if( r.meta.requestStatus == "fulfilled" ) {
                toggler( false );
                resetAllFields( );

                dispatch( toggleSnackbar( { message: "Usuario actualizado", type: "success" } ) );

                const updatedUser = r.payload as User;
                
                if( onUserUpdate )
                    onUserUpdate( updatedUser );
            }
        } )
        .catch( e => {
            console.error( e );
        } );
    };

    return (
        <Modal 
            openModal={ opened } 
            closeModal={ ( ) => handleClose( ) } 
            title={ `${ selectedUser ? "Editar" : "Crear" } usuario` }
            actions={[
                { label: "Cerrar", callback: ( ) => handleClose( ) },
                { label: "Guardar", callback: selectedUser ? handleUserUpdate : handleUserCreate, disabled: !canCreate }
            ]}
        >
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                <TextInput 
                    id={ "username" } label="Usuario" value={ userData.username } 
                    placeholder="jperez"
                    handleChange={ v => updateField( "username", v ) }
                    error={ !!inputErrors.username }
                    helperText={ inputErrors.username }
                />
                <TextInput 
                    id={ "email" } label="Correo" value={ userData.email } 
                    placeholder="jperez@llansaingenieros.com.ni"
                    handleChange={ v => { 
                        updateField( "email", v );
                    } }
                    error={ !!inputErrors.email }
                    helperText={ inputErrors.email }
                />
                <TextInput label="Nombre" value={ userData.name } handleChange={ v => updateField( "name", v ) } placeholder="Juan"/>
                <TextInput label="Apellido" value={ userData.lastname } handleChange={ v => updateField( "lastname", v ) } placeholder="Pérez"/>
                <Select 
                    value={ userData.selectedRole } 
                    label="Rol" 
                    options={ roles } 
                    handleChange={ v => updateField( "selectedRole", v as CatalogOption ) } 
                    noOptionsText="No hay datos"
                    sx={{ width: "250px" }}
                />
                <Select 
                    multiple 
                    allowUnknown
                    value={ userData.selectedProjects } 
                    label="Proyectos" 
                    options={ projects } 
                    handleChange={ v => updateField( "selectedProjects", v as CatalogOption[ ] ) } 
                    noOptionsText="No hay datos"
                    disabled={ 
                        !roleRequiresProject( userData.selectedRole?.label ?? "" ) }
                    sx={{ width: "250px" }}
                />
            </Box>
        </Modal>
    );
};

export default UserManageModal;
