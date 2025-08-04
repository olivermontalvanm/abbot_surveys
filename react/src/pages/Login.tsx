import { FC, useState } from "react";
import { Button, Container, Typography, Box, Card as MUICard, TextField as Input, styled, useTheme, Snackbar, Alert, OutlinedInput, InputAdornment, IconButton } from "@mui/material";
import AppIcon from "../assets/nursing-logo.png"
import { useAppDispatch } from "../hooks/hooks";
import { useSelector } from "react-redux";
import { login as loginAction, RootState, setRequestedPassChange, requestPasswordChange } from "../store/store";
import { Visibility, VisibilityOff } from "@mui/icons-material";
interface KeyboardEvent {
    key: string;
    preventDefault: ( ) => unknown;
}

const Card = styled( MUICard )`
    display: flex;
    flex-flow: column;
    align-items: center;
    padding: 1rem;
    gap: 0.85rem;
    max-width: 230px;
    margin: auto;

    .MuiTextField-root, .MuiButtonBase-root, .input-label {
        width: 100%;
    }

    .input-label {
        text-align: left;
    }
`;

const LlansaLogo = styled( "img" )`
    width: 120px;
    height: auto;
`;

const Login: FC = ( ) => {
    const dispatch = useAppDispatch( );
    const theme = useTheme( );

    const [ username, setUsername ] = useState<string>( "" );
    const [ pwd, setPwd ] = useState<string>( "" );
    const [ forgotPassword, setForgotPassword ] = useState<boolean>( false );
    const [ snackbar, setSnackbar ] = useState<{
		status: boolean;
		message?: string;
		type?: "success" | "error";
	}>( { status: false } );
    const [ showPass, setShowPass ] = useState<boolean>( false );

    const { requestedPassChange } = useSelector( ( state: RootState ) => state.common );

    const login = ( ) => {
        dispatch( loginAction( { username, password: pwd } ) )
        .then( r => {
            if( r.meta.requestStatus == "rejected" ) {
                setSnackbar( {
                    status: true,
                    message: "Usuario o contraseña incorrectos",
                    type: "error"
                } );
            }
        } );
    }

    const handleEnterKey = ( e: KeyboardEvent ) => {
        if( e.key == "Enter" ) {
            e.preventDefault( );
            login( );
        }

        return true;
    };
    
    return (
        <Container sx={{ margin: "0 auto", textAlign: "center", height: "100vh", overflowY: "auto", backgroundColor: theme.palette.asphalt, maxWidth: "100vw !important", width: "100vw" }}>
            <Box sx={{ display: "flex", flexFlow: "column", justifyContent: "center", margin: "auto", height: "100%" }}>
                <Box component={"form"}>
                    <Card sx={{ backgroundColor: "white !important" }}>
                        <LlansaLogo src={AppIcon} alt="Icono Llansa" style={{ marginBottom: "0.5rem" }} />
						
                        {/*<Typography variant="header3" fontWeight="400">Seguimiento de Órdenes de Compra</Typography>*/}

                        {!requestedPassChange && <Box>
                            <Typography className="input-label">Usuario</Typography>
                            <Input 
                                onKeyUp={ handleEnterKey }
                                variant="outlined" 
                                type="text" 
                                placeholder="jperez" 
                                onChange={ e => setUsername( String( e.target.value ).toLowerCase( ).trim( ) ) } 
                                value={ username } />
                        </Box>}
						
                        {!forgotPassword && <>
                            <Box>
                                <Typography className="input-label">Contraseña</Typography>
                                <OutlinedInput 
                                    onKeyUp={ handleEnterKey } 
                                    type={ showPass ? "text" : "password" } 
                                    placeholder="" 
                                    onChange={ e => setPwd( e.target.value ) } 
                                    value={ pwd }
                                    autoComplete="on"
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton onClick={ ( ) => setShowPass( p => !p ) } sx={{ outline: "none !important" }}>
                                                { showPass ? <Visibility /> : <VisibilityOff /> }
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                            </Box>
                            {/*<Typography className="input-label" style={{ margin: "0.85rem 0", textDecoration: "underline", cursor: "pointer" }} onClick={ ( ) => setForgotPassword( true ) }>¿Olvidó su contraseña?</Typography>*/}
                            <Button sx={{ marginTop: "1rem" }} disabled={ !username || !pwd } onClick={( ) => login( )} variant="contained"><Typography style={{ textTransform: "none" }}>Ingresar</Typography></Button>
                        </>}

                        {( forgotPassword && !requestedPassChange ) && <>
                            <Box sx={{ border: "solid 1px black", borderRadius: "8px", boxSizing: "border-box", backgroundColor: theme.palette.grayBg, color: theme.palette.asphalt }}>
                                <Typography fontSize={12} textAlign={"justify"} padding={"10px"}>Al hacer clic en el botón, se enviará una solicitud a los usuarios ITS. Una vez aprobada su solicitud, podrá definir su nueva clave en el próximo inicio de sesión.</Typography>
                            </Box>
                            <Button onClick={( ) => setForgotPassword( false ) } variant="contained" sx={{ backgroundColor: "transparent !important", border: "solid 1px black", color: theme.palette.asphalt }}><Typography style={{ textTransform: "none" }}>Cancelar</Typography></Button>
                            <Button disabled={ !username } onClick={( ) => dispatch( requestPasswordChange( { username } ) )} variant="contained"><Typography style={{ textTransform: "none" }}>Solicitar cambio de clave</Typography></Button>
                        </>}

                        {requestedPassChange && <>
                            <Box sx={{ border: "solid 1px black", borderRadius: "8px", boxSizing: "border-box", backgroundColor: theme.palette.grayBg, color: theme.palette.asphalt }}>
                                <Typography fontSize={12} textAlign={"justify"} padding={"10px"}>Se ha enviado la solicitud a los usuarios ITS. Una vez aprobada la solicitud, podrá definir su clave en el próximo inicio de sesión.</Typography>
                            </Box>
                            <Button
                                onClick={( ) => { 
                                    dispatch( setRequestedPassChange( false ) );
                                    setForgotPassword( false );
                                }}
                                variant="contained"
                            ><Typography style={{ textTransform: "none" }}>Aceptar</Typography></Button>
                        </>}
                    </Card>
                    {/*<Typography style={{ marginTop: "1rem" }}>Llansa Ingenieros @ 2025</Typography>*/}
                </Box>
            </Box>
            <Snackbar
                open={ snackbar.status }
                autoHideDuration={1000}
                onClose={( ) => setSnackbar( { status: false } )}
            >
                <Alert
                    onClose={( ) => setSnackbar( { status: false } )}
                    severity={ snackbar.type ?? "error" }
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    { snackbar.message }
                </Alert>
            </Snackbar>
        </Container>
    );
};


export default Login;
