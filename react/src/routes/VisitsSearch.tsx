import { Box, Button, Card, CardActionArea, CardContent, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import MobileLayout from "../layouts/MobileLayout";
import TextInput from "../components/inputs/TextInput";
import { useAppDispatch } from "../hooks/hooks";
import { getDataQuery } from "../store/store";
import DoctorImage from "../assets/HCP_icon.svg";

const VisitsForm: FC = ( ) => {
    const dispatch = useAppDispatch( );
    
    const [ name, setName ] = useState<string>( "" );
    const [ hospital, setHospital ] = useState<string>( "" );
    const [ loggedUser, setLoggedUser ] = useState<never|null>( null );
    const [ loading, setLoading ] = useState<boolean>( false );
    const [ data, setData ] = useState<{
        name: string;
        fullname: string; hospital: string;
        ix: number; lastnames: string; service: string;
        submissionId: number;
    }[]>( [ ] );

    useEffect( ( ) => {
        const user = JSON.parse( localStorage.getItem( "loggedUser" ) );

        if( user ) {
            setLoggedUser( user );
        } else {
            window.location.assign( "/login" );
        }    
        
        searchData( );
    }, [ ] );
    
    const searchData = ( ) => {
        setLoading( true );
        dispatch( getDataQuery( { name, hospital } ) ).unwrap( )
        .then( res => {
            setData( res );
        } )
        .finally( ( ) => {
            setLoading( false );
        } );
    };
    
    return (
        <MobileLayout>
            <Stack direction="row" justifyContent="space-between" sx={{ padding: "0 0.5rem" }}>
                <Button onClick={ ( ) => window.location.assign( "/surveys" )}>&lt; Volver</Button>
                {
                    ( loggedUser && loggedUser["role"] == "admin" ) && (
                        <Button onClick={ ( ) => window.location.assign( "/replies/visits" )}>Ver respuestas &gt;</Button>
                    )
                }
            </Stack>
            <Box 
                sx={{ 
                    maxWidth: 600, margin: "auto", mx: "auto", p: 3, m: 2, 
                    boxSizing: "border-box", backgroundColor: "#ffffff", borderRadius: 3,
                    boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.4)"
                }}
            >
                <Stack direction={"row"} gap="1rem">
                    <Box mb={"1rem"}>
                        <TextInput
                            label=""
                            placeholder="Nombre"
                            handleChange={v => setName( v )}
                            value={ name }
                            sx={{ width: "auto" }}
                            onKeyUp={k => {
                                if( k.key == "Enter" ) {
                                    searchData( );
                                }
                            }}
                        />
                    </Box>
                    <Box>
                        <TextInput
                            label=""
                            placeholder="Hospital"
                            handleChange={v => setHospital( v )}
                            value={ hospital }
                            sx={{ width: "auto" }}
                            onKeyUp={k => {
                                if( k.key == "Enter" ) {
                                    searchData( );
                                }
                            }}
                        />
                    </Box>
                </Stack>
                <Box sx={{ width: "100%" }}>
                    <Button onClick={( ) => searchData( )} variant="contained">Buscar</Button>
                </Box>
                <Divider sx={{ m: "1rem 0" }} />
                <Box sx={{ display: "flex", flexFlow: "column", alignItems: "center", justifyContent: "center" }}>
                    {
                        data.length == 0 ? (
                            <Typography color="rgba(0,0,0,0.5)">{ loading ? "Cargando..." : "No hay datos" }</Typography>
                        ) : (
                            data.map( (d, ix) => (
                                <Card sx={{ width: "100%", mb: "0.5rem" }} key={ ix }>
                                    <CardActionArea onClick={( ) => window.location.assign( `/forms/visits/${ d.submissionId }` )}>
                                        <Box
                                            sx={{ 
                                                mb: "0.5rem", width: "100%", display: "flex", 
                                                flexFlow: "row", alignItems: "center", 
                                                justifyContent: "flex-start",
                                                boxSizing: "border-box", p: "0.5rem", cursor: "pointer",
                                                gap: "1rem"
                                            }}
                                        >
                                            <Box><img src={ DoctorImage } height="40" /></Box>
                                            <Divider orientation="vertical" sx={{ height: "3rem" }} />
                                            <Box>
                                                <Typography variant="body1">{ d.fullname }</Typography>
                                                <Typography variant="body2">Hospital: { d.hospital }</Typography>
                                                <Typography variant="body2">Servicio: { d.service }</Typography>
                                            </Box>
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            ) )
                        )
                    }
                    { data.length == 50 ? <Typography>Mostrando limite de 50 resultados</Typography> : null }
                </Box>
            </Box>
        </MobileLayout>
    );
};

export default VisitsForm;
