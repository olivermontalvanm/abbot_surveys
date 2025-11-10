import React, { useEffect, useMemo, useState } from 'react';
import {
    Accordion, AccordionSummary, AccordionDetails,
    Typography, Box, List, ListItem, ListItemText,
    Stack, Button, Select, MenuItem, InputLabel, FormControl,
    Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAppDispatch } from '../hooks/hooks';
import { getVisits, getVisitsCSV, Visit } from '../store/store';
import { useParams } from 'react-router-dom';
import MobileLayout from '../layouts/MobileLayout';

interface Question {
    id: number;
    label: string;
    type: string;
    visible: boolean;
    order: number;
}

interface Answer {
    id: number;
    value: string;
    Question: Question;
}

interface Submission {
    id: number;
    createdAt: string;
    ipaddress: string;
    Answers: Answer[];
    User: { id: number; username: string; } | null;
    Survey: { title: string; };
}

const VisitResponses: React.FC = () => {
    const { surveyid } = useParams();
    const [ visits, setVisits ] = useState<Visit[]>( [] );
    const [ selectedValue, setSelectedValue ] = useState<string>( '' );
    const dispatch = useAppDispatch();

    useEffect( () => {
        dispatch( getVisits( ) )
        .unwrap()
        .then( d => setVisits( d ) );
    }, [ ] );

    const filteredSubmissions = useMemo( () => {
        if ( !selectedValue ) return visits;

        return visits.filter( ( sub ) =>
            sub.Answers.some(
                ( answer ) =>
                    answer.Question.label.toLowerCase().includes( 'hospital' ) &&
                    answer.value === selectedValue
            )
        );
    }, [ selectedValue, visits ] );

    return (
        <MobileLayout>
            <Stack direction="row" justifyContent="space-between" sx={ { padding: "0 0.5rem" } }>
                <Button onClick={ () => window.location.assign( "/forms/visits" ) }>
                    &lt; Volver
                </Button>
                <Button variant="contained" disabled={ visits?.length == 0 }
                    onClick={ ( ) => dispatch( getVisitsCSV( ) )}
                >Descargar</Button>
            </Stack>

            <Box p={ 2 }>
                <Typography variant="h5">
                    Registros de Visitas
                </Typography>
                <Typography variant="body1" mb={"1.5rem"}>Hasta 50 registros más recientes</Typography>
                {
                    visits.length == 0 ? (
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
                    visits.map( ( v, ix ) => (
                        <Paper
                            key={ v?.id ?? ix }
                            sx={{ mb: "0.75rem", boxSizing: "border-box", p: "0.5rem" }}
                        >
                            <Box
                                sx={{ display: "grid", gridTemplateColumns: "30% 30% auto", gap: "0.5rem", boxSizing: "border-box" }}
                            >
                                <Box>
                                    <Typography variant="body2">Fecha</Typography>
                                    <Typography variant="body1">{ v.date }</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2">Hora</Typography>
                                    <Typography variant="body1">{ v.time }</Typography>
                                </Box>
                                <Box sx={{ overflow: "hidden" }}>
                                    <Typography variant="body2">Ubicación</Typography>
                                    <Typography variant="body1" sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
                                        <a href={ v.location } target="_blank">
                                            { v.location }
                                        </a></Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2">Nombre</Typography>
                                    <Typography variant="body1">{ v.name }</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2">Apellidos</Typography>
                                    <Typography variant="body1">{ v.lastnames }</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2">Servicio</Typography>
                                    <Typography variant="body1">{ v.service }</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2">Hospital</Typography>
                                    <Typography variant="body1">{ v.hospital }</Typography>
                                </Box>
                                <Box sx={{ overflow: "hidden" }}>
                                    <Typography variant="body2">País</Typography>
                                    <Typography variant="body1" sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
                                        { v.country }
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2">Objetivo de visita</Typography>
                                    <Typography variant="body1">{ v.goal }</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2">Marca</Typography>
                                    <Typography variant="body1">{ v.brands }</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2">HCP Capacitados</Typography>
                                    <Typography variant="body1">{ v.trainedHcps }</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2">Se realizó actividad</Typography>
                                    <Typography variant="body1">{ v.activityDone }</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2">Resultado de la visita</Typography>
                                    <Typography variant="body1">{ v.visitResult }</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    ) )
                }
            </Box>
        </MobileLayout>
    );
};

export default VisitResponses;
