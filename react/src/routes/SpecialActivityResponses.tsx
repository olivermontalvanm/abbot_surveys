import React, { useEffect, useState } from 'react';
import { Typography, Box, Stack, Button, Paper } from '@mui/material';
import { useAppDispatch } from '../hooks/hooks';
import { getSpecialActivities, getSpecialActivitiesCSV, SpecialActivity } from '../store/store';
import MobileLayout from '../layouts/MobileLayout';

const Field: React.FC<{ label: string; children: React.ReactNode; wide?: boolean; }> = ( { label, children, wide } ) => (
    <Box sx={{ overflow: "hidden", gridColumn: wide ? "1 / -1" : undefined }}>
        <Typography variant="body2">{ label }</Typography>
        <Typography variant="body1" sx={ wide ? { whiteSpace: "pre-wrap", wordBreak: "break-word" } : { textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" } }>
            { children }
        </Typography>
    </Box>
);

const SpecialActivityResponses: React.FC = () => {
    const [ activities, setActivities ] = useState<SpecialActivity[]>( [] );
    const dispatch = useAppDispatch();

    useEffect( () => {
        dispatch( getSpecialActivities( ) )
        .unwrap()
        .then( d => setActivities( d ) );
    }, [ ] );

    return (
        <MobileLayout>
            <Stack direction="row" justifyContent="space-between" sx={ { padding: "0 0.5rem" } }>
                <Button onClick={ () => window.location.assign( "/forms/special-activities" ) }>
                    &lt; Volver
                </Button>
                <Button variant="contained" disabled={ activities?.length == 0 }
                    onClick={ ( ) => dispatch( getSpecialActivitiesCSV( ) )}
                >Descargar</Button>
            </Stack>

            <Box p={ 2 }>
                <Typography variant="h5">
                    Registros de Capacitaciones Especiales
                </Typography>
                <Typography variant="body1" mb={"1.5rem"}>Hasta 50 registros más recientes</Typography>
                {
                    activities.length == 0 ? (
                        <Paper sx={{ p: "1rem" }}>
                            <Typography
                                sx={{ margin: "auto", textAlign: "center" }}
                            >
                                No se encontró data...
                            </Typography>
                        </Paper>
                    ) : null
                }
                {
                    activities.map( ( a, ix ) => (
                        <Paper
                            key={ a?.id ?? ix }
                            data-testid="special-activity-row"
                            sx={{ mb: "0.75rem", boxSizing: "border-box", p: "0.5rem" }}
                        >
                            <Box
                                sx={{ display: "grid", gridTemplateColumns: "30% 30% auto", gap: "0.5rem", boxSizing: "border-box" }}
                            >
                                <Field label="Fecha">{ a.date }</Field>
                                <Field label="Hora">{ a.time }</Field>
                                <Field label="Ubicación">
                                    <a href={ a.location } target="_blank">{ a.location }</a>
                                </Field>
                                <Field label="Usuario">{ a.User?.username }</Field>
                                <Field label="País">{ a.country }</Field>
                                <Field label="Marca abordada">{ a.brand }</Field>
                                <Field label="Hospital" wide>{ a.hospital }</Field>
                                <Field label="Cantidad de asistentes">{ a.attendees }</Field>
                                <Field label="Tema abordado" wide>{ a.topic }</Field>
                                <Field label="Comentarios" wide>{ a.comments }</Field>
                            </Box>
                        </Paper>
                    ) )
                }
            </Box>
        </MobileLayout>
    );
};

export default SpecialActivityResponses;
