import { 
    Box, styled, useTheme, Typography, 
    Card, InputAdornment, OutlinedInput, IconButton, Divider, 
    Button, FormControl, TextField, Autocomplete as MUIAutocomplete,
    Snackbar, Alert,
    Stack,
    Tooltip
} from "@mui/material";
import React, { FC, useState, useEffect } from "react";
import LlansaLogo from "../assets/llansa-icon.png";
import { 
    Logout as ExitIcon, Group as UsersIcon, 
    AccountCircle as UserIcon, Search as SearchIcon, 
    AddCircleOutlineRounded as PlusIcon, ExitToApp, 
    Assignment, CheckCircle,
    Leaderboard,
    AssignmentInd,
    AssignmentTurnedIn,
    HourglassTop
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
dayjs.locale( "es" );
import { useAppDispatch } from "../hooks/hooks";
import { useSelector } from "react-redux";
import { 
    RootState, setActivityOptions, setSelectedProject, 
    logout, getLoggedUser, setModalOpen, setSelectedStatus,
    fetchAllProjectOptions, fetchAllRoleOptions,
    setSelectedRequest, setToolbarOpened,
    //setDrawerStatus
} from "../store/store";
import { setSelectedActivity, toggleSnackbar, setIsMobile } from "../store/store";
import Sitemap from "../routes/Sitemap";
import { getSearchWithFirstPage, userUtils } from "../utils/Utils";
import { User as UserModel, Project as ProjectModel, Activity as ActivityModel } from "../interfaces/Models";
import { userRoles } from "../constants";
import { CatalogOption } from "../interfaces/Common";
import { useWindowSize } from "../hooks/hooks";

const Container = styled( Box )`
    min-height: 100vh;

    position: relative;

    padding: 0 !important;

    color: ${ ( { theme } ) => theme.palette.asphalt };
    
    .line {
        border: 1px solid white;
    }

    width: 100vw;
`;

const Autocomplete = styled( MUIAutocomplete )`
    margin-top: 0.5rem;

    input {
        width: 100% !important;
        height: 25px;
    }
    
    .MuiButtonBase-root {
        background-color: transparent !important;
    }
`;

const MenuBar = styled( Box )`
    display: flex;
    flex-flow: column;
    align-items: center;
    height: 100vh;
    position: fixed;
    left: 0;
    box-sizing: border-box;

    background-color: ${ cx => cx.theme.palette.pureWhite } !important;

    justify-content: space-between;

    width: 72px;
    z-index: 14;

    svg {
        font-size: 28px;
    }

	box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.35);
`;

const ToolBar = styled( Box )`
    display: flex;
    flex-flow: column;
    align-items: center;
    height: 100vh;
    position: fixed;
    top: 72px;
    right: 0px;
    box-sizing: border-box;
    border: 1px solid ${ ( { theme: { palette } } ) => palette.grayBg2 };
    padding: 0 0 72px 0;

    background-color: ${ cx => cx.theme.palette.pureWhite } !important;

    justify-content: space-between;

    width: 72px;
    z-index: 14;

    svg {
        font-size: 28px;
    }

    min-height: 100px;
    min-width: 305px;
`;

const TopBar = styled( Box )`
    display: flex;
	z-index: 13;
    flex-flow: row;
    align-items: center;
    flex-direction: row-reverse;
    width: 100%;
    position: sticky;
    top: 0;

    border: 1px solid ${ ( { theme: { palette } } ) => palette.grayBg2 };

    background-color: ${ cx => cx.theme.palette.pureWhite } !important;

    height: 72px;
    padding-left: 72px;
    padding-right: 1rem;
    box-sizing: border-box;
`;
const Navigation = styled( Box )`
    display: flex;
    flex-flow: column;
    flex-grow: 1;
    align-items: center;
    align-content: center;
    justify-content: center;
    width: 100%;
	z-index: 10
`;

const NavItem: FC<{ 
    to?: string; label?: string; 
    icon: React.ElementType; active?: boolean; 
    callback?: ( ) => void;
}> = ( {
    to, label, icon, active, callback
} ) => {
    const Icon = icon;
    const theme = useTheme( );
    const navigate = useNavigate( );
    const { search } = useLocation( );
    
    return (
        <Box 
            sx={{ position: "relative", width: "100%", cursor: "pointer", textAlign: "center" }}
            onClick={( ) => { 
                if( callback )
                    callback( );

                const stringParams = getSearchWithFirstPage( new URLSearchParams( search ) );

                if( to )
                    navigate( to + stringParams );
            }}
        >
            <Icon />
            <Typography sx={{ fontSize: "12px" }}>{label}</Typography>
            { active && (
                <Box sx={{
                    minWidth: "4px",
                    minHeight: "100%",
                    backgroundColor: theme.palette.llansaRed,
                    position: "absolute",
                    right: "-4px",
                    top: 0,
                    borderRadius: "0 8px 8px 0"
                }} />
            ) }
        </Box>
    );
}

const UserInfo: FC<{ user: UserModel | null }> = ( { user } ) => {
    return (
        <Box sx={{ display: "flex", flexFlow: "row", alignItems: "center", gap: "1rem" }}>
            <Box sx={{ textAlign: "center" }}>
                <Typography variant="header2">{ userUtils.getFullName( user ) ?? ""}</Typography>
                <Typography variant="body2">{ user?.userRole.title }</Typography>
            </Box>
            <Box sx={{ display: "flex", flexFlow: "column" }}>
                <UserIcon sx={{ fontSize: "32px" }} />
            </Box>
        </Box>
    );
}

const DesktopLayout: FC<{ children: React.ReactNode }> = ( { children } ) => {
    const theme = useTheme( );
    const { drawerOpened, loggedUser, toolbarOpened, projects, snackbar } = useSelector( ( state: RootState ) => state.common );
    const { selectedActivity, selectedProject, selectedStatus, statusOptions } = useSelector( ( state: RootState ) => state.filter );
    const dispatch = useAppDispatch( );
    const location = useLocation( );

    const [ , setLocation ] = useState( location );

    const [ size ] = useWindowSize( );

    useEffect( ( ) => {
        dispatch( setIsMobile( window.mobileCheck( ) ) );
    }, [ size ] );

    useEffect( ( ) => {
        dispatch( getLoggedUser( ) );

        dispatch( fetchAllProjectOptions( ) );
        dispatch( fetchAllRoleOptions( ) );
    }, [ ] );

    useEffect( ( ) => {
        dispatch( setActivityOptions( [ ] ) );
        dispatch( setSelectedActivity( null ) );
    }, [ selectedProject ] );

    useEffect( ( ) => { 
        setLocation( location ); 

        dispatch( setSelectedRequest( null ) );
        dispatch( setToolbarOpened( false ) );
    }, [ location ] );

    const getMenuOptions = ( ) => {
        const options = [ ];

        const isCurrentLink = ( compareLink: string ) => {
            const currentUrl = new URL( window.location.href );
            const pathname = currentUrl.pathname;

            return compareLink == pathname;
        }

        const dashboardItem = ( ) => (
            <Navigation>
                <NavItem label="Resumen" icon={Leaderboard} to={ Sitemap.dashboard } active={ isCurrentLink( Sitemap.dashboard ) } />
            </Navigation>
        );
        const reviewItem = ( ) => (
            <Navigation>
                <NavItem label="Revisión" icon={AssignmentTurnedIn} to={ Sitemap.requestsReview } active={ isCurrentLink( Sitemap.requestsReview ) } />
            </Navigation>
        );
        const assignItem = ( ) => (
            <Navigation>
                <NavItem label="Asignación" icon={AssignmentInd} to={ Sitemap.requestsAssign } active={ isCurrentLink( Sitemap.requestsAssign ) } />
            </Navigation>
        );
        const requestsItem = ( ) => (
            <Navigation>
                <NavItem label="Pendiente" icon={Assignment} to={ Sitemap.requests } active={ isCurrentLink( Sitemap.requests ) } />
            </Navigation>
        );
        const inProgressItem = ( ) => (
            <Navigation>
                <NavItem label="En proceso" icon={HourglassTop} to={ Sitemap.inProgressRequests } active={ isCurrentLink( Sitemap.inProgressRequests ) } />
            </Navigation>
        );
        const finishedRequestsItem = ( ) => (
            <Navigation>
                <NavItem label="Finalizado" icon={CheckCircle} to={ Sitemap.finishedRequests } active={ isCurrentLink( Sitemap.finishedRequests ) } />
            </Navigation>
        );
        const admonItem = ( ) => (
            <Navigation>
                <NavItem label="Usuarios" icon={UsersIcon} to={ Sitemap.users } active={ isCurrentLink( Sitemap.users ) } />
            </Navigation>
        );
				
        if( loggedUser?.userRole?.title ) {
            switch( loggedUser?.userRole?.title ) {
                case userRoles.its:
                    options.push( admonItem );	
                    break;

                case userRoles.shoppingChief:
                    options.push( assignItem );
                    break;
            }
            
            if( ![ userRoles.its ].includes( loggedUser?.userRole?.title ) ) {
                options.push( requestsItem, inProgressItem, finishedRequestsItem );

                if( ![ userRoles.shoppingAnalyst, userRoles.shoppingChief, userRoles.adminManagement ].includes( loggedUser?.userRole?.title ) )
                    options.unshift( reviewItem );

                if( loggedUser?.userRole?.title == userRoles.costChief )
                    options.unshift( dashboardItem );
            }
        }

        return options;
    }

    return (
        <Container>
            <MenuBar>
                <Box sx={{ 
                    zIndex: 2, backgroundColor: "#FFF", 
                    height: "100vh", display: "flex", flexFlow: "column", 
                    justifyContent: "space-between", border: "1px solid #E4E7EF"
                }}>
                    <Box 
                        style={{ height: "72px", boxSizing: "border-box", padding: "5px", cursor: "pointer", zIndex: 21 }} 
                        onClick={ ( ) => { 
                            //  TODO Quizá habilitar otra acción
                            /**
                             * Ya que no se utilizarán los filtros globales.
                             */
                            return;
                            //dispatch( setDrawerStatus( !drawerOpened ) );
                        } }
                    >
                        <img style={{ maxWidth: "100%", height: "100%", objectFit: "contain" }} src={ LlansaLogo } alt="Logo Llansa" />
                    </Box>
                    <Box sx={{ width: "100%", display: "flex", flexFlow: "column", gap: "2rem" }}>
                        {
                            getMenuOptions( ).map( ( OP, i ) => <OP key={ i } /> )
                        }
                    </Box>
                    <Box style={{ height: "72px", width: "100%", display: "flex", flexFlow: "column", alignItems: "center", justifyContent: "center" }}>
                        <NavItem icon={ExitIcon} label="Salir" callback={ ( ) => dispatch( logout( ) ) } />
                    </Box>
                </Box>
                <Card elevation={4} sx={{ 
                	display: "flex", flexFlow: "column",
                	gap: "1rem",
                	alignItems: "center",
                	position: "absolute", left: drawerOpened ? `${ 70 }px` : `-${270}px`, top: "0", 
                	height: "100vh", width: "270px", 
                	backgroundColor: `${ theme.palette.pureWhite } !important`,
                	zIndex: -1, padding: "1rem", boxSizing: "border-box",
                    borderRadius: "0 15px 15px 0 !important",
                    transition: "left 0.25s"
                }}
                >
                	<OutlinedInput
                		type="text"
                		endAdornment={
                			<InputAdornment position="end" sx={{ "button": { backgroundColor: "transparent !important", outline: "none !important" } }}><IconButton size="medium" edge="end"><SearchIcon /></IconButton></InputAdornment>
                		}
                		sx={{ borderRadius: "30px", border: `solid 1px ${ theme.palette.pureWhite }`, padding: "0 1rem" }}
                	/>
                	<Divider orientation="horizontal" flexItem />
                	<Button sx={{ width: "100%", backgroundColor: theme.palette.asphalt, color: theme.palette.white2, textTransform: "none" }} endIcon={ <PlusIcon /> } onClick={( ) => dispatch( setModalOpen( { status: true, component: "newRequest" } ) )}>Crear pedido</Button>
                	<FormControl>
                		<label htmlFor="project">Proyectos</label>
                		<Autocomplete 
                			id="project" value={ selectedProject ?? { label: "Todos" } } 
                			options={ projects } 
                			getOptionLabel={ o => ( o as CatalogOption ).label } 
                			renderInput={params => (
                				<TextField {...params} variant="outlined" />
                			)} 
                			onChange={( _, v ) => dispatch( setSelectedProject( v as ProjectModel ) ) }
                			noOptionsText="No hay valores"
                		/>
                	</FormControl>
                	<FormControl>
                		<label htmlFor="activity">Actividades</label>
                		<Autocomplete 
                			id="activity" value={ selectedActivity ?? { title: "Todas" } } 
                			options={ selectedProject?.activities ?? [ ] } 
                			getOptionLabel={ o => ( o as never )[ "title" ] } 
                			renderInput={params => (
                				<TextField {...params} variant="outlined" />
                			)} 
                			onChange={( _, v ) => dispatch( setSelectedActivity( v as ActivityModel ) ) }
                			noOptionsText="No hay valores"
                			disabled={ !selectedProject }
                		/>
                	</FormControl>
                	<FormControl>
                		<label htmlFor="status">Estatus</label>
                		<Autocomplete 
                			id="status" value={ selectedStatus } 
                			options={ statusOptions } 
                			getOptionLabel={o => ( o as typeof statusOptions[ 0 ] ).label } 
                			renderInput={params => (
                				<TextField {...params} variant="outlined" />
                			)} 
                			onChange={( _, v ) => dispatch( setSelectedStatus( v as { value: string; label: string; } ) ) }
                			noOptionsText="No hay valores"
                		/>
                	</FormControl>
                </Card>
            </MenuBar>
            <TopBar>
                <UserInfo user={ loggedUser } />
            </TopBar>
            <Box 
                sx={{ 
                    paddingLeft: `${ 72 + ( drawerOpened ? 270 : 0 )}px`,
                    paddingRight: `${ ( toolbarOpened ? 305 : 0 )}px`,
                    boxSizing: "border-box",
                    backgroundColor: "#E8EBED",
                    transition: "padding-left 0.25s, padding-right 0.25s",
                }} 
            >
                { children }
            </Box>
            { toolbarOpened &&
                <ToolBar>
                    <Box sx={{ width: "100%" }}>
                        <Stack direction="column" alignItems="flex-start" sx={{ padding: "0.5rem 0" }}>
                            <Tooltip title="Ocultar comentarios">
                                <IconButton
                                    onClick={ ( ) => {
                                        dispatch( setToolbarOpened( false ) );
                                    } }
                                ><ExitToApp /></IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                	<Box sx={{ 
                		width: "100%", display: "flex", flexFlow: "column", gap: "0.5rem", overflowY: "auto", padding: "0.5rem",
                		"&::-webkit-scrollbar": {
                			display: "none",
                			width: "0px"
                		}, flexGrow: 1, boxSizing: "border-box",
                		boxShadow: "inset 0px 0px 5px 0px rgba(0,0,0,0.35)",
                		justifyContent: "center",
                        backgroundColor: theme.palette.white
                	}}>
                	</Box>
                </ToolBar>
            }
            <Snackbar
                open={ snackbar.show }
                autoHideDuration={6000}
                onClose={( ) => dispatch( toggleSnackbar( { } ) )}
            >
                <Alert
                    onClose={( ) => dispatch( toggleSnackbar( { } ) ) }
                    severity={ snackbar.type }
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    { snackbar.message }
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default DesktopLayout;
