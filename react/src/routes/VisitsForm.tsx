import { Alert, AlertTitle, Box, Button, Card, CardActionArea, CardContent, Divider, Grid, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import MobileLayout from "../layouts/MobileLayout";
import TextInput from "../components/inputs/TextInput";
import { useAppDispatch } from "../hooks/hooks";
import { getDataQuery, postVisit } from "../store/store";
import DoctorImage from "../assets/HCP_icon.svg";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

const VisitsForm: FC = ( ) => {
    const dispatch = useAppDispatch( );
    const { submissionId } = useParams( );
    
    const brands = [ "GLUCERNA 1.5", "OSMOLITE", "YEVITY" ];
    const activityDoneOptions = [ "SI", "NO" ];
    
    const [ date, setDate ] = useState<string>( dayjs( ).format( "DD/MM/YYYY" ) );
    const [ time, setTime ] = useState<string>( dayjs( ).format( "hh:mm a" ) );
    const [ location, setLocation ] = useState<string>( "" );
    const [ objective, setObjective ] = useState<string>( "" );
    const [ brand, setBrand ] = useState<string>( brands[ 0 ] );
    const [ trainedHcp, setTrainedHcp ] = useState<string>( "" );
    const [ activityDone, setActivityDone ] = useState<string>( activityDoneOptions[ 0 ] );
    const [ activityResult, setActivityResult ] = useState<string>( "" );
    const [ locPermission, setLocPermission ] = useState<boolean>( false );
    const [ loggedUser, setLoggedUser ] = useState<never|null>( null );
    const [ loading, setLoading ] = useState<boolean>( false );
    const [ data, setData ] = useState<{
        name: string;
        fullname: string; hospital: string;
        ix: number; lastnames: string; service: string;
        submissionId: number; country: string;
    } | null>( null  );
    const [ toast, setToast ] = useState( { open: false, message: "" } );

    useEffect( ( ) => {
        const user = JSON.parse( localStorage.getItem( "loggedUser" ) );

        if( user ) {
            setLoggedUser( user );
        } else {
            window.location.assign( "/login" );
        }    
        
        if( submissionId ) searchData( submissionId );
    }, [ submissionId ] );

    useEffect( ( ) => {
        setGeolocation( );
    }, [ ] );

    const setGeolocation = ( ) => {
        if( "geolocation" in navigator ) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const base = `https://www.google.com/maps/place/`;
                    const { latitude, longitude } = pos.coords;
                    
                    setLocation( `${ base }${ latitude },${ longitude }` );
                }
            )
        }
    };

    const setDateTime = ( ) => {
        setDate( dayjs( ).format( "DD/MM/YYYY" ) );
        setTime( dayjs( ).format( "hh:mm a" ) );
    };
    
    const searchData = ( submissionId: string  ) => {
        setLoading( true );
        dispatch( getDataQuery( { submissionId } ) ).unwrap( )
        .then( res => {
            if( res.length ) {
                setData( res[ 0 ] );
            } else {
                window.location.assign( "/forms/visits" );
            }
        } )
        .finally( ( ) => {
            setLoading( false );
        } );
    };

    const clearFields = ( ) => {
        setDateTime( );
        setGeolocation( );
        setObjective( "" );
        setBrand( brands[ 0 ] );
        setTrainedHcp( "" );
        setActivityDone( activityDoneOptions[ 0 ] );
        setActivityResult( "" );
    };

    const submitData = ( ) => {
        if( !data ) return;
        
        dispatch( postVisit( {
            date, time, location, 
            name: data.name, lastnames: data.lastnames, 
            service: data.service, hospital: data.hospital,
            goal: objective, brands: brand, activityDone, 
            visitResult: activityResult, trainedHcps: trainedHcp,
            country: data.country
        } ) )
        .then( ( ) => {
            setToast( { open: true, message: "Datos enviados con éxito" } );
            clearFields( );
        } );
    }

    navigator.permissions.query( { name: "geolocation" } )
    .then( ps => {
        if( ps.state === "denied" ) {
            setLocPermission( false );
            return;
        }

        setLocPermission( true );
    } );
    
    return (
        <MobileLayout>
            <Snackbar
                open={ toast.open }
                autoHideDuration={ 3000 }
                onClose={ ( ) => setToast( { message: "", open: false } ) }
                anchorOrigin={ { vertical: "bottom", horizontal: "center" } }
            >
                <Alert onClose={ ( ) => setToast( { message: "", open: false } ) }>
                    { toast.message }
                </Alert>
            </Snackbar>
            <Stack direction="row" justifyContent="space-between" sx={{ padding: "0 0.5rem" }}>
                <Button onClick={ ( ) => window.location.assign( "/forms/visits" )}>&lt; Volver</Button>
            </Stack>
            <Box 
                component="form" 
                onSubmit={e => {
                    e.preventDefault( );
                    submitData( )
                }} 
                sx={{ 
                    maxWidth: 600, margin: "auto", mx: "auto", p: 6, m: 2, 
                    boxSizing: "border-box", backgroundColor: "#ffffff", borderRadius: 3,
                    boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.4)"
                }}>
                <Typography variant="h5" fontWeight={500} color="#1e4479" gutterBottom>Registro de Visita</Typography>
                {
                    locPermission ? null : (
                        <Alert severity="error" sx={{ mb: "1rem" }}>
                            <AlertTitle>No fue posible obtener la ubicación</AlertTitle>
                            Debe otorgar permiso de ubicación en su navegador para agregar información al formulario.
                        </Alert>
                    )
                }
                <Stack spacing={2}>
                    <TextField
                        disabled
                        type={"text"}
                        required={true}
                        value={data?.country}
                        onChange={( ) => null}
                        fullWidth
                        sx={{ display: "none" }}
                    />
                    <TextField
                        disabled
                        type={"text"}
                        required={true}
                        value={date}
                        onChange={(e) => null}
                        /*InputProps={{
                            inputProps: {
                                min: q.minvalue ?? undefined,
                                max: q.maxvalue ?? undefined
                            }
                        }}*/
                        fullWidth
                        sx={{ backgroundColor: "#ffffff" }}
                    />
                    <TextField
                        disabled
                        type={"text"}
                        required={true}
                        value={time}
                        onChange={(e) => null}
                        /*InputProps={{
                            inputProps: {
                                min: q.minvalue ?? undefined,
                                max: q.maxvalue ?? undefined
                            }
                        }}*/
                        fullWidth
                        sx={{ backgroundColor: "#ffffff" }}
                    />
                    <TextField
                        disabled
                        type={"text"}
                        required={true}
                        value={location}
                        onChange={(e) => null}
                        /*InputProps={{
                            inputProps: {
                                min: q.minvalue ?? undefined,
                                max: q.maxvalue ?? undefined
                            }
                        }}*/
                        fullWidth
                        sx={{ backgroundColor: "#ffffff" }}
                    />
                    <TextField
                        disabled
                        type={"text"}
                        required={true}
                        value={data?.name}
                        onChange={(e) => null}
                        /*InputProps={{
                            inputProps: {
                                min: q.minvalue ?? undefined,
                                max: q.maxvalue ?? undefined
                            }
                        }}*/
                        fullWidth
                        sx={{ backgroundColor: "#ffffff" }}
                    />
                    <TextField
                        disabled
                        type={"text"}
                        required={true}
                        value={data?.lastnames}
                        onChange={(e) => null}
                        /*InputProps={{
                            inputProps: {
                                min: q.minvalue ?? undefined,
                                max: q.maxvalue ?? undefined
                            }
                        }}*/
                        fullWidth
                        sx={{ backgroundColor: "#ffffff" }}
                    />
                    <TextField
                        disabled
                        type={"text"}
                        required={true}
                        value={data?.service}
                        onChange={(e) => null}
                        /*InputProps={{
                            inputProps: {
                                min: q.minvalue ?? undefined,
                                max: q.maxvalue ?? undefined
                            }
                        }}*/
                        fullWidth
                        sx={{ backgroundColor: "#ffffff" }}
                    />
                    <TextField
                        disabled
                        type={"text"}
                        required={true}
                        value={data?.hospital}
                        onChange={(e) => null}
                        /*InputProps={{
                            inputProps: {
                                min: q.minvalue ?? undefined,
                                max: q.maxvalue ?? undefined
                            }
                        }}*/
                        fullWidth
                        sx={{ backgroundColor: "#ffffff" }}
                    />
                    <TextField
                        label={"Objetivo de visita"}
                        type={"text"}
                        required
                        value={objective}
                        onChange={e => setObjective( e.target.value )}
                        /*InputProps={{
                            inputProps: {
                                min: q.minvalue ?? undefined,
                                max: q.maxvalue ?? undefined
                            }
                        }}*/
                        fullWidth
                        sx={{ backgroundColor: "#ffffff" }}
                    />
                    <TextField
                        select
                        label={"Marcas"}
                        required
                        value={brand}
                        onChange={e => setBrand( e.target.value )}
                        fullWidth
                        InputProps={ {
                            sx: { height: "40px"  } 
                        } }
                        sx={{ backgroundColor: "#ffffff", height: "40px" }}
                    >
                        {
                            brands.map( ( b, ix ) => (
                                <MenuItem key={ ix } value={ b }>{ b }</MenuItem>
                            ) )
                        }
                    </TextField>
                    <TextField
                        label={"HCP Capacitados"}
                        required
                        type="text"
                        value={ trainedHcp }
                        onChange={e => setTrainedHcp( e.target.value )}
                        fullWidth
                    />
                    <TextField
                        select
                        label={"Se realizó actividad"}
                        required
                        value={ activityDone }
                        onChange={e => setActivityDone( e.target.value )}
                        fullWidth
                        InputProps={ {
                            sx: { height: "40px"  } 
                        } }
                        sx={{ backgroundColor: "#ffffff", height: "40px" }}
                    >
                        {
                            activityDoneOptions.map( ( b, ix ) => (
                                <MenuItem key={ ix } value={ b }>{ b }</MenuItem>
                            ) )
                        }
                    </TextField>
                    <TextField
                        label={"Resultado de la visita"}
                        required
                        type="text"
                        value={ activityResult }
                        onChange={e => setActivityResult( e.target.value )}
                        fullWidth
                    />
                    <Stack direction="column" gap="1rem" width="300px" alignSelf="center" justifyContent="center">
                        <Button
                            sx={{ backgroundColor: "#00b5f0" }} type="submit" variant="contained" 
                            disabled={ [ date, time, location, data, locPermission, objective, trainedHcp, activityResult ].some( d => !d ) }
                        >Enviar</Button>
                        <Button variant="contained" color="inherit" onClick={ ( ) => clearFields( )}>Limpiar</Button>
                    </Stack>
                </Stack>
            </Box>
        </MobileLayout>
    );
};

export default VisitsForm;
