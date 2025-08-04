import { FC, useEffect, useState } from "react";
import Modal from "../components/Modal";
import { Box, Divider, Stack, Typography } from "@mui/material";
import Select from "../components/inputs/Select";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";
import { CatalogOption } from "../interfaces/Common";
import TextInput from "../components/inputs/TextInput";
import { Request } from "../interfaces/Models";
import Switch from "../components/inputs/Switch";

interface formDataType {
    item: CatalogOption | null;
    quantity: string;
    measureUnit: CatalogOption | null;
    isUrgent: boolean;
};

const initialFormData: formDataType = {
    item: null, quantity: "",
    measureUnit: null, isUrgent: false
};

const EditRequestModal: FC<{
    opened: boolean; toggler: ( param: { opened: boolean; request: Request | null } ) => void;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    onEdit: Function; request: Request | null; mobile?: boolean;
}> = ( { opened, toggler, request, onEdit, mobile = false } ) => {
    const { items, measureUnits } = useSelector( ( state: RootState ) => state.common );
    
    const [ loading ] = useState<boolean>( false );
    const [ canEdit, setCanEdit ] = useState<boolean>( false );
    const [ formData, setFormData ] = useState<formDataType>( initialFormData );

    useEffect( ( ) => {
        validateFormFields( );
    }, [ formData ] );

    useEffect( ( ) => {
        if( request ) {
            setFormData( {
                ...formData,
                item: { id: request?.item?.id, label: request?.item?.title },
                measureUnit: { id: request?.measureUnit?.id, label: request?.measureUnit?.title },
                quantity: request?.quantity?.toString( ), isUrgent: request?.isUrgent
            } );
        }
    }, [ opened, request ] );
    
    const handleClose = ( ) => {
        toggler( { opened: false, request: null } );
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setFormField = ( field: keyof formDataType, value: any ) => {
        setFormData( { ...formData, [ field ]: value } );
    };

    const validateFormFields = ( ) => {
        const { item: selectedItem, quantity, measureUnit } = formData;

        const parsedQuantity = Number( quantity );

        if( selectedItem && !isNaN( parsedQuantity ) && quantity && measureUnit ) {
            setCanEdit( true );
        } else {
            setCanEdit( false );
        }
    };

    if( mobile ) {
        return (
            <Modal
                openModal={ opened && !!request }
                closeModal={ ( ) => handleClose( ) }
                title="Editar"
                actions={[
                    { label: "Cancelar", callback: ( ) => handleClose( ), disabled: loading, variant: "text", sx: { color: "black", backgroundColor: "transparent !important" } },
                    { label: "Guardar", callback: ( ) => onEdit( request, formData ), disabled: !canEdit || loading }
                ]}
            >
                <Stack direction="column" gap="1rem">
                    <Box sx={{ display: "grid", flexFlow: "row" }}>
                        <Select 
                            label="Material"
                            options={ items }
                            value={ formData.item }
                            disableClearable
                            handleChange={ e => setFormField( "item", e ) }
                            noSelectionText="-- Seleccionar material --"
                            allowUnknown
                            highlightUnknown
                            sx={{ width: "280px" }}
                        />
                    </Box>
                    <Stack direction="row" gap="0.5rem" boxSizing="border-box">
                        <Stack direction="column">
                            <Typography variant="body2">Cantidad</Typography>
                            <TextInput
                                disabled={ loading } 
                                label="" 
                                value={ formData.quantity } 
                                handleChange={ v => setFormField( "quantity", v ) } 
                                sx={{ width: "280px" }}
                                disableSelectOnFocus
                            />
                        </Stack>
                    </Stack>
                    <Stack direction="row" gap="0.5rem" boxSizing="border-box">
                        <Select 
                            label="Unidad de medida"
                            options={ measureUnits }
                            value={ formData.measureUnit }
                            disableClearable
                            handleChange={ e => setFormField( "measureUnit", e ) }
                            noSelectionText="-- Seleccionar material --"
                            sx={{ width: "280px" }}
                        />
                    </Stack>
                    <Stack direction="row">
                        <Stack direction="column">
                            <Typography variant="body2" mb="0.5rem">Pedido urgente</Typography>
                            <Switch 
                                checked={ formData.isUrgent } 
                                onChange={ v => { setFormField( "isUrgent", v ); } } 
                                label=""
                                offLabel="No"
                                onLabel="Sí"
                            />
                        </Stack>
                    </Stack>
                </Stack>
            </Modal>
        );
    } else {
        return (
            <Modal
                openModal={ opened && !!request }
                closeModal={ ( ) => handleClose( ) }
                title="Editar solicitud de material"
                actions={[
                    { label: "Cancelar", callback: ( ) => handleClose( ), disabled: loading, variant: "text", sx: { color: "black", backgroundColor: "transparent !important" } },
                    { label: "Guardar", callback: ( ) => onEdit( request, formData ), disabled: !canEdit || loading }
                ]}
            >
                <Stack direction="row" gap="1rem">
                    <Stack direction="column" gap="1rem">
                        <TextInput
                            disabled={ true }
                            label="Nº de Pedido"
                            value={ request?.reqNumber ?? "" }
                            handleChange={ ( ) => null }
                        />
                        <TextInput
                            disabled={ true }
                            label="Proyecto"
                            value={ request?.project?.title ?? "" }
                            handleChange={ ( ) => null }
                        />
                        <TextInput
                            disabled={ true }
                            label="Actividad"
                            value={ request?.activity?.title ?? "" }
                            handleChange={ ( ) => null }
                        />
                    </Stack>
                    <Divider orientation="vertical" />
                    <Stack direction="column" gap="1rem">
                        <Box sx={{ display: "grid", flexFlow: "row" }}>
                            <Select 
                                label="Material"
                                options={ items }
                                value={ formData.item }
                                disableClearable
                                handleChange={ e => setFormField( "item", e ) }
                                noSelectionText="-- Seleccionar material --"
                                allowUnknown
                                highlightUnknown
                            />
                        </Box>
                        <Stack direction="row" gap="1rem">
                            <TextInput
                                disabled={ loading } 
                                label="Cantidad" 
                                sx={{ width: "250px" }} 
                                value={ formData.quantity } 
                                handleChange={ v => setFormField( "quantity", v ) } 
                            />
                            <Select 
                                label="Unidad de medida"
                                options={ measureUnits }
                                value={ formData.measureUnit }
                                disableClearable
                                handleChange={ e => setFormField( "measureUnit", e ) }
                                noSelectionText="-- Seleccionar material --"
                            />
                        </Stack>
                        <Stack direction="row">
                            <Switch 
                                checked={ formData.isUrgent } 
                                onChange={ v => { setFormField( "isUrgent", v ); } } 
                                label="Pedido urgente"
                                offLabel="No"
                                onLabel="Sí"
                            />
                        </Stack>
                    </Stack>
                </Stack>
            </Modal>
        );    
    }
};

export default EditRequestModal;
