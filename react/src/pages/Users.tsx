import { Typography, Container, Box, Paper, Stack, Chip, IconButton, Tooltip } from "@mui/material";
import { useState, useEffect } from "react";
//import PieChart from "../components/charts/PieChart";
import { useSelector } from "react-redux";
import { RootState, fetchAllProjectOptions, updateUser, toggleSnackbar } from "../store/store";
//import Table from "../components/Table";
import { useAppDispatch } from "../hooks/hooks";
import { 
    getUsers, 
    //getUsersSummary 
} from "../store/store";
import { User } from "../interfaces/Models";
import UserManageModal from "../features/UserManageModal";
import FancyTable from "../components/FancyTable";
import { userRoles } from "../constants";
import { CatalogOption } from "../interfaces/Common";
import Switch from "../components/inputs/Switch";
import { Edit } from "@mui/icons-material";

const Users = () => {
    const dispatch = useAppDispatch( );
    
    const { projects } = useSelector( ( state: RootState ) => state.common );
    
    /*const [ inProgressRequests, setInProgressRequests ] = useState<number>( 0 );
	const [ chartData, setChartData ] = useState<{
        labels: string[];
        datasets: { data: number[]; backgroundColor: string[]; borderColor: string; borderWidth: number; }[]
    }>( { labels: [], datasets: [] } );*/
    const [ users, setUsers ] = useState<User[ ]>( [ ] );
    const [ openModal, setOpenModal ] = useState<boolean>( false );
    const [ usersTablePage, setUsersTablePage ] = useState<number>( 1 );
    const [ tableLoading, setTableLoading ] = useState<boolean>( false );
    const [ tableSearchVal, setTableSearchVal ] = useState<string>( "" );
    const [ selectedProjectTableFilter, setSelectedProjectTableFilter ] = useState<CatalogOption | null>( null );
    const [ selectedStatusTableFilter, setSelectedStatusTableFilter ] = useState<CatalogOption | null>( null );
    const [ tableTotal, setTableTotal ] = useState<number>( 0 );
    const [ totalPages, setTotalPages ] = useState<number>( 0 );
    const [ selectedUser, setSelectedUser ] = useState<User | null>( null );

    useEffect( ( ) => {
        fetchUsers( );
        //fetchUsersSummary( );
    }, [ ] );

    /*useEffect( ( ) => {
		let totalRequests = 0;

		totalRequests = requests.map( r => r.amount ).reduce( ( acc, v ) => acc += v );

		setInProgressRequests( totalRequests );

		setChartData( {
			labels: requests.filter( l => l.amount ).map( l => l.label ),
			datasets: [ { 
				data: requests.filter( l => l.amount ).map( a => a.amount ), 
				backgroundColor: [ "#7A86CB", "#4EC2F7", "#455A64" ],
				borderColor: "#FFF",
				borderWidth: 1
			} ]
		} );
	}, [ requests ] );*/

    useEffect( ( ) => {
        fetchUsers( );
    }, [ selectedProjectTableFilter, selectedStatusTableFilter, usersTablePage ] );

    useEffect( ( ) => {
        setUsersTablePage( 1 );
    }, [ selectedProjectTableFilter, selectedStatusTableFilter ] );

    const handleUserSearch = ( ) => {
        fetchUsers( );
        setUsersTablePage( 1 );
    }

    const statusOptions: CatalogOption[ ] = [
        { id: 0, label: "Inactivo" },
        { id: 1, label: "Activo" }
    ]

    const fetchUsers = async ( ) => {
        setTableLoading( true );
		
        dispatch( getUsers( { 
            page: usersTablePage, 
            filters: { 
                name: tableSearchVal ?? undefined,
                project: selectedStatusTableFilter?.id ? Number( selectedProjectTableFilter?.id ) : undefined, 
                status: selectedStatusTableFilter?.id ? Number( selectedStatusTableFilter?.id ) : undefined
            }
        } ) )
        .then( response => {
            const payload = ( response.payload as never );

            if ( response.meta.requestStatus == "fulfilled" ) {
                setUsers( payload[ "data" ] );
                setTableTotal( payload[ "total" ] );
                setTotalPages( payload[ "pages" ] );
            }

            setTableLoading( false );
        } );
    }

    /*const fetchUsersSummary = async ( ) => {
		dispatch( getUsersSummary( ) ).then( response => {
			if( response.meta.requestStatus == "fulfilled" )
				console.debug( { response } );
		} );
	}*/

    const onUserCreate = ( ) => {
        dispatch( fetchAllProjectOptions( ) );
        setUsersTablePage( 1 );
        fetchUsers( );
    }
	
    const onUserUpdate = ( updatedUser: User ) => {
        dispatch( fetchAllProjectOptions( ) );
        fetchUsers( );

        const usersCopy = ( Object.assign( [ ], users ) ) as User[ ];
        let matchingUser = usersCopy.find( u => u.id == updatedUser.id );

        matchingUser = { ...updatedUser };

        setUsers( usersCopy );
    }
	
    const handleUserUpdate = ( userData: {
		id: number, username?: string,
		firstname?: string, lastname?: string,
		email?: string, roleId?: number,
		projects?: string[ ], isActive?: boolean
	} ) => {
        dispatch( updateUser( userData ) )
        .then( r => {
            if( r.meta.requestStatus == "fulfilled" ) {
                const updatedUser = r.payload as User;

                const usersCopy = ( Object.assign( [], users ) ) as User[ ];
                const foundUser = usersCopy.find( u => u.id == userData.id );
	
                if( foundUser?.isActive !== undefined )
                    foundUser.isActive = updatedUser.isActive;
	
                setUsers( usersCopy );

                dispatch( toggleSnackbar( { message: `Usuario ${ foundUser?.isActive ? "activado" : "desactivado" }` } ) );
            }
        } );
    };

    return (
        <Container sx={{ display: "flex", flexFlow: "column", gap: "1rem" }}>
            {/*<Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
				<Paper variant="rounded" elevation={3} sx={{ boxSizing: "border-box", padding: "1rem", backgroundColor: "white !important" }}>
					<PieChart chartData={ chartData } style={{ minHeight: "80px", minWidth: "200px" }} title="Usuarios activos por rol" />
				</Paper>
				<Paper variant="rounded" elevation={3} sx={{backgroundColor: "white !important", textAlign: "center", boxSizing: "border-box", padding: "1rem", display: "flex", justifyContent: "center", flexFlow: "column" }}>
					<Typography fontSize={28}>{ inProgressRequests }</Typography>
					<Typography>Usuarios activos</Typography>
				</Paper>
			</Box>*/}
            <Paper variant="rounded" sx={{ padding: "1rem", border: "solid 1px #E4E7EF" }}>
                <FancyTable 
                    title="Tabla de usuarios" 
                    subtitle="Listado de cuentas de usuario en el sistema" 
                    columns={[ 
                        { label: "Nombre/Rol", format: ( row: User ) => (
                            <Box>
                                <Typography>{ `${row?.firstname} ${row?.lastname}` }</Typography>
                                <Typography variant="body3">{ row?.userRole?.title }</Typography>
                            </Box>
                        ) }, 
                        { label: "Usuario", format: ( row: User ) => <Typography>{ row.username }</Typography> }, 
                        { label: "Correo", format: ( row: User ) => <Typography><a href={ `mailto:${ row.email }` } target="_blank">{ row.email }</a></Typography> }, 
                        { label: "Proyecto(s)", format: ( row: User ) => ( 
                            <Stack direction={"column"} spacing={1}>
                                {
                                    (
                                    //	TODO Create util method to determine if a role is project-scoped
                                        [ userRoles.projectAdmin, userRoles.projectOpsManagement, userRoles.projectResident ].includes( row?.userRole?.title ) ?
                                            row.projects :
                                            [ { title: "Todos" } ]
                                    ).map( ( p, i ) => (
                                        <Chip 
                                            label={ p.title } 
                                            color={ "default" } 
                                            variant="outlined" 
                                            sx={{ width: "fit-content !important" }}
                                            size="small"
                                            key={ i }
                                        />
                                    ) )
                                }
                            </Stack>
                        ) }, 
                        { label: "Estatus", format: ( row: User ) => ( 
                            <Box onClick={ e => e.stopPropagation( ) }>
                                <Switch checked={ row.isActive } onChange={ ( ) => handleUserUpdate( { id: row.id, isActive: !row.isActive } ) } />
                            </Box>
                        ) },
                        { label: "", format: ( user: User ) => {
                            return (
                                <Tooltip title="Editar usuario">
                                    <IconButton
                                        onClick={ ev => {
                                            ev.stopPropagation( );
                                            setSelectedUser( user );
                                            setOpenModal( true );
                                        } }
                                    ><Edit /></IconButton>
                                </Tooltip>
                            );
                        } }
                    ]}
                    data={ [ ...users ] }
                    searchAction={{ placeholder: "Buscar usuario", onSearch: handleUserSearch }}
                    createAction={{ label: "Crear usuario", callback: ( ) => { setSelectedUser( null ); setOpenModal( true ); } }}
                    template="25% 10% 30% 20% 100px 50px"
                    loading={ tableLoading }
                    filters={ [
                        { allLabel: "Proyecto", options: projects, onChange: setSelectedProjectTableFilter, selected: selectedProjectTableFilter },
                        { allLabel: "Estatus", options: statusOptions, onChange: setSelectedStatusTableFilter, selected: selectedStatusTableFilter }
                    ] }
                    total={ tableTotal }
                    pages={ totalPages }
                    onNextPage={ ( ) => setUsersTablePage( usersTablePage < totalPages ? usersTablePage + 1 : usersTablePage ) }
                    onPreviousPage={ ( ) => setUsersTablePage( usersTablePage > 1 ? usersTablePage - 1 : usersTablePage ) }
                    currentPage={ usersTablePage }
                    highlightClickedRow={ false }
                />
            </Paper>
            <UserManageModal opened={ openModal } toggler={ setOpenModal } onUserCreate={ onUserCreate } onUserUpdate={ onUserUpdate } selectedUser={ selectedUser } />
        </Container>
    )
}

export default Users;
