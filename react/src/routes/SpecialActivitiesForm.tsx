import { Alert, AlertTitle, Autocomplete, Box, Button, MenuItem, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import MobileLayout from "../layouts/MobileLayout";
import { useAppDispatch } from "../hooks/hooks";
import { getSpecialActivityHospitals, postSpecialActivity, specialActivityBrands, SpecialActivityHospital } from "../store/store";
import dayjs from "dayjs";

//  The theme squeezes every input to 40px with no vertical padding (see styles/mui-theme.tsx);
//  restore MUI's default outlined sizing so these fields match the Hospital autocomplete.
const defaultInputSx = {
    "& .MuiInputBase-input": { height: "1.4375em", padding: "16.5px 14px !important" }
};

const SpecialActivitiesForm: FC = ( ) => {
    const dispatch = useAppDispatch( );

    const [ date, setDate ] = useState<string>( dayjs( ).format( "DD/MM/YYYY" ) );
    const [ time, setTime ] = useState<string>( dayjs( ).format( "hh:mm a" ) );
    const [ location, setLocation ] = useState<string>( "" );
    const [ hospitals, setHospitals ] = useState<SpecialActivityHospital[ ]>( [ ] );
    const [ hospital, setHospital ] = useState<SpecialActivityHospital | null>( null );
    const [ brand, setBrand ] = useState<string>( "" );
    const [ topic, setTopic ] = useState<string>( "" );
    const [ attendees, setAttendees ] = useState<string>( "" );
    const [ comments, setComments ] = useState<string>( "" );
    const [ locPermission, setLocPermission ] = useState<boolean>( true );
    const [ loggedUser, setLoggedUser ] = useState<{ role?: string; country?: string | null; } | null>( null );
    const [ sending, setSending ] = useState<boolean>( false );
    const [ toast, setToast ] = useState<{ open: boolean; message: string; severity: "success" | "error"; }>( { open: false, message: "", severity: "success" } );

    useEffect( ( ) => {
        const user = JSON.parse( localStorage.getItem( "loggedUser" ) ?? "null" );

        if( user ) {
            setLoggedUser( user );
        } else {
            window.location.assign( "/login" );
            return;
        }

        dispatch( getSpecialActivityHospitals( ) ).unwrap( )
        .then( h => setHospitals( h ) );

        setGeolocation( );

        navigator.permissions?.query( { name: "geolocation" } )
        .then( ps => {
            setLocPermission( ps.state !== "denied" );
            ps.onchange = ( ) => setLocPermission( ps.state !== "denied" );
        } );
    }, [ ] );

    const setGeolocation = ( ) => {
        if( "geolocation" in navigator ) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const base = `https://www.google.com/maps/place/`;
                    const { latitude, longitude } = pos.coords;

                    setLocation( `${ base }${ latitude },${ longitude }` );
                },
                ( ) => setLocPermission( false )
            );
        }
    };

    const setDateTime = ( ) => {
        setDate( dayjs( ).format( "DD/MM/YYYY" ) );
        setTime( dayjs( ).format( "hh:mm a" ) );
    };

    const clearFields = ( ) => {
        setDateTime( );
        setGeolocation( );
        setHospital( null );
        setBrand( "" );
        setTopic( "" );
        setAttendees( "" );
        setComments( "" );
    };

    const submitData = ( ) => {
        if( !hospital ) return;

        setSending( true );
        dispatch( postSpecialActivity( {
            date, time, location,
            hospital: hospital.hospital, hospitalCountry: hospital.country, brand,
            topic, attendees, comments
        } ) ).unwrap( )
        .then( ( ) => {
            setToast( { open: true, message: "Datos enviados con éxito", severity: "success" } );
            clearFields( );
        } )
        .catch( ( ) => {
            setToast( { open: true, message: "No fue posible enviar los datos", severity: "error" } );
        } )
        .finally( ( ) => setSending( false ) );
    };

    //  Users without a country (e.g. admins) get hospitals of every country, grouped
    const groupByCountry = !loggedUser?.country;

    const canSubmit = [ date, time, location, locPermission, hospital, brand, topic.trim( ), attendees.trim( ) ].every( d => !!d );

    return (
        <MobileLayout>
            <Snackbar
                open={ toast.open }
                autoHideDuration={ 3000 }
                onClose={ ( ) => setToast( { ...toast, open: false } ) }
                anchorOrigin={ { vertical: "bottom", horizontal: "center" } }
            >
                <Alert severity={ toast.severity } onClose={ ( ) => setToast( { ...toast, open: false } ) }>
                    { toast.message }
                </Alert>
            </Snackbar>
            <Stack direction="row" justifyContent="space-between" sx={{ padding: "0 0.5rem" }}>
                <Button onClick={ ( ) => window.location.assign( "/surveys" )}>&lt; Volver</Button>
                {
                    ( loggedUser && loggedUser.role == "admin" ) && (
                        <Button onClick={ ( ) => window.location.assign( "/replies/special-activities" )}>Ver respuestas &gt;</Button>
                    )
                }
            </Stack>
            <Box
                component="form"
                onSubmit={e => {
                    e.preventDefault( );
                    submitData( );
                }}
                sx={{
                    maxWidth: 600, margin: "auto", mx: "auto", p: 6, m: 2,
                    boxSizing: "border-box", backgroundColor: "#ffffff", borderRadius: 3,
                    boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.4)"
                }}>
                <Typography variant="h5" fontWeight={500} color="#1e4479" gutterBottom>Actividades Especiales</Typography>
                {
                    locPermission ? null : (
                        <Alert severity="error" sx={{ mb: "1rem" }}>
                            <AlertTitle>No fue posible obtener la ubicación</AlertTitle>
                            Debe otorgar permiso de ubicación en su navegador para agregar información al formulario.
                        </Alert>
                    )
                }
                <Stack spacing={2}>
                    <Autocomplete
                        options={ hospitals }
                        value={ hospital }
                        onChange={ ( _, v ) => setHospital( v ) }
                        groupBy={ groupByCountry ? ( h => h.country ) : undefined }
                        getOptionLabel={ h => h.hospital }
                        getOptionKey={ h => `${ h.country }|${ h.hospital }` }
                        isOptionEqualToValue={ ( a, b ) => a.country === b.country && a.hospital === b.hospital }
                        noOptionsText="No se encontraron hospitales"
                        renderInput={ params => (
                            <TextField { ...params } label="Hospital" required />
                        ) }
                        fullWidth
                    />
                    <TextField
                        select
                        label={"Marca abordada"}
                        required
                        value={brand}
                        onChange={e => setBrand( e.target.value )}
                        fullWidth
                        sx={defaultInputSx}
                    >
                        {
                            specialActivityBrands.map( b => (
                                <MenuItem key={ b } value={ b }>{ b }</MenuItem>
                            ) )
                        }
                    </TextField>
                    <TextField
                        label={"Tema abordado"}
                        required
                        multiline
                        minRows={3}
                        value={topic}
                        onChange={e => setTopic( e.target.value )}
                        fullWidth
                    />
                    <TextField
                        label={"Cantidad de asistentes"}
                        required
                        type="text"
                        value={attendees}
                        onChange={e => setAttendees( e.target.value )}
                        inputProps={{ inputMode: "numeric", maxLength: 255 }}
                        fullWidth
                        sx={defaultInputSx}
                    />
                    <TextField
                        label={"Comentarios"}
                        multiline
                        minRows={3}
                        value={comments}
                        onChange={e => setComments( e.target.value )}
                        fullWidth
                    />
                    <Stack direction="column" gap="1rem" width="300px" alignSelf="center" justifyContent="center">
                        <Button
                            sx={{ backgroundColor: "#00b5f0" }} type="submit" variant="contained"
                            disabled={ !canSubmit || sending }
                        >Enviar</Button>
                        <Button variant="contained" color="inherit" onClick={ ( ) => clearFields( )}>Limpiar</Button>
                    </Stack>
                </Stack>
            </Box>
        </MobileLayout>
    );
};

export default SpecialActivitiesForm;
