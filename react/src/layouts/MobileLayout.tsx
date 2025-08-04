import { 
    Box, styled, Typography, Container as MUIContainer,
    Snackbar, Alert,
    Button,
    CardActionArea
} from "@mui/material";
import React, { FC, useState, useEffect } from "react";
import AppLogo from "../assets/nursing-logo.png";
import { ExitToApp } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
dayjs.locale( "es" );
import { useAppDispatch } from "../hooks/hooks";
import { useSelector } from "react-redux";
import { 
    RootState, setActivityOptions, getLoggedUser, 
    fetchAllProjectOptions, fetchAllRoleOptions,
    fetchRequestNotes as fetchRequestNotesAction,
    setSelectedRequest
} from "../store/store";
import { setSelectedActivity, toggleSnackbar, setIsMobile } from "../store/store";
import { userUtils } from "../utils/Utils";
import { User as UserModel } from "../interfaces/Models";
import { useWindowSize } from "../hooks/hooks";
import RequestCreateModal from "../features/RequestCreateModal";

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

const TopBar = styled( Box )`
    display: flex;
    z-index: 10;
    flex-flow: row;
    align-items: center;
	justify-content: space-between;
    width: 100%;
    position: sticky;
    top: 0;

	padding: 0 1rem;

    border: 1px solid ${ ( { theme: { palette } } ) => palette.grayBg2 };

    background-color: ${ cx => cx.theme.palette.pureWhite } !important;

    height: 72px;
    box-sizing: border-box;
`;

const UserInfo: FC<{ user: UserModel | null }> = ( { user } ) => {
    return (
        <Box sx={{ display: "flex", flexFlow: "row", alignItems: "center", gap: "1rem" }}>
            <Box sx={{ textAlign: "center" }}>
                { user?.username }
            </Box>
            <Box>
                <Button
                    sx={{ color: "inherit", padding: "0" }}
                    onClick={ ( ) => window.location.assign( "/login" ) }
                >
                    <ExitToApp sx={{ fontSize: "32px" }} />
                </Button>
            </Box>
        </Box>
    );
}

const MobileLayout: FC<{ children: React.ReactNode }> = ( { children } ) => {
    const { snackbar, selectedRequest } = useSelector( ( state: RootState ) => state.common );
    const { selectedProject } = useSelector( ( state: RootState ) => state.filter );
    const dispatch = useAppDispatch( );
    const location = useLocation( );

    const [ , setNotes ] = useState<{ author: string; createdAt: string; content: string; authorRole: string; }[ ]>( [ ] );
    const [ , setLocation ] = useState( location );
    const [ newRequestModalOpened, setNewRequestModalOpened ] = useState<boolean>( false );

    const [ size ] = useWindowSize( );

    const loggedUser = JSON.parse( localStorage.getItem( "loggedUser" ) );

    useEffect( ( ) => {
        dispatch( setIsMobile( window.mobileCheck( ) ) );
    }, [ size ] );

    useEffect( ( ) => {
    }, [ ] );

    const fetchRequestNotes = ( requestId: number ) => {
        dispatch( fetchRequestNotesAction( requestId ) )
        .unwrap( ).then( notes => {
            setNotes( notes.map( note => ( {
                author: `${ note?.author?.firstname } ${ note?.author?.lastname }`,
                authorRole: note?.author?.userRole?.title,
                createdAt: dayjs( note?.createdAt ).toString( ),
                content: note?.content,
            } ) ) );
        } );
    };

    return (
        <Container>
            <TopBar>
                <CardActionArea onClick={( ) => window.location.assign( "/surveys" )}>
                    <Box style={{ height: "72px", boxSizing: "border-box", padding: "0.75rem" }}>
                        <img style={{ maxWidth: "100%", height: "100%", objectFit: "contain" }} src={ AppLogo } alt="Logo Llansa" />
                    </Box>
                </CardActionArea>
                <UserInfo user={ loggedUser } />
            </TopBar>
            <Box 
                sx={{ 
                    boxSizing: "border-box",
                    backgroundColor: "#E8EBED",
                    transition: "padding-left 0.25s",
                    paddingBottom: "72px"
                }} 
            >
                <MUIContainer sx={{ boxSizing: "border-box", padding: "1rem 0 3rem 0", minHeight: "100vh", backgroundColor: "#E8EBED" }}>
                    { children }
                </MUIContainer>
            </Box>
            <RequestCreateModal
                opened={ newRequestModalOpened }
                toggler={ ( ) => setNewRequestModalOpened( !newRequestModalOpened ) }
                mobile
            />
            <Snackbar
                open={ snackbar.show }
                autoHideDuration={6000}
                onClose={( ) => dispatch( toggleSnackbar( { } ) )}
            >
                <Alert
                    onClose={( ) => dispatch( toggleSnackbar( { } ) ) }
                    severity="success"
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    { snackbar.message }
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default MobileLayout;
