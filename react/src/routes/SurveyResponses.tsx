import React, { useEffect, useMemo, useState } from 'react';
import {
    Accordion, AccordionSummary, AccordionDetails,
    Typography, Box, List, ListItem, ListItemText,
    Stack, Button, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAppDispatch } from '../hooks/hooks';
import { getReplies, getRepliesCSV } from '../store/store';
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

const SurveyResponses: React.FC = () => {
    const { surveyid } = useParams();
    const [ submissions, setSubmissions ] = useState<Submission[]>( [] );
    const [ selectedValue, setSelectedValue ] = useState<string>( '' );
    const dispatch = useAppDispatch();

    useEffect( () => {
        if ( surveyid ) {
            dispatch( getReplies( { surveyid: Number( surveyid ) } ) )
            .unwrap()
            .then( ( d ) => setSubmissions( d as Submission[] ) );
        }
    }, [ surveyid, dispatch ] );

    const hospitalValues = useMemo( () => {
        const values = new Set<string>();
        submissions.forEach( ( sub ) =>
            sub.Answers.forEach( ( answer ) => {
                if ( answer.Question.label.toLowerCase().includes( 'hospital' ) ) {
                    values.add( answer.value.trim() );
                }
            } )
        );
        return Array.from( values ).sort();
    }, [ submissions ] );

    const filteredSubmissions = useMemo( () => {
        if ( !selectedValue ) return submissions;

        return submissions.filter( ( sub ) =>
            sub.Answers.some(
                ( answer ) =>
                    answer.Question.label.toLowerCase().includes( 'hospital' ) &&
                    answer.value === selectedValue
            )
        );
    }, [ selectedValue, submissions ] );

    return (
        <MobileLayout>
            <Stack direction="row" justifyContent="space-between" sx={ { padding: "0 0.5rem" } }>
                <Button onClick={ () => window.location.assign( window.location.pathname.replace( "/replies", "" ) ) }>
                    &lt; Volver
                </Button>
                <Button variant="contained" disabled={ submissions.length == 0 }
                    onClick={ ( ) => dispatch( getRepliesCSV( { surveyid } ) )}
                >Descargar</Button>
            </Stack>

            <Box p={ 2 }>
                <Typography variant="h5" gutterBottom>
                    { submissions.at( -1 )?.Survey?.title }
                </Typography>
                
                <FormControl fullWidth size="small" sx={ { mb: 2 } }>
                    <InputLabel>Filtrar por hospital</InputLabel>
                    <Select
                        value={ selectedValue }
                        onChange={ ( e ) => setSelectedValue( e.target.value ) }
                        label="Filtrar por hospital"
                        sx={{ height: "40px", backgroundColor: "#ffffff" }}
                    >
                        <MenuItem value="">( Mostrar todos )</MenuItem>
                        { hospitalValues.map( ( value, idx ) => (
                            <MenuItem key={ idx } value={ value }>
                                { value }
                            </MenuItem>
                        ) ) }
                    </Select>
                </FormControl>

                { filteredSubmissions.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" align="center" mt={ 4 }>
                        No hay respuestas que coincidan con el filtro.
                    </Typography>
                ) : (
                    filteredSubmissions.map( ( submission, ix ) => (
                        <Accordion key={ submission.id } defaultExpanded>
                            <AccordionSummary expandIcon={ <ExpandMoreIcon /> }>
                                <Typography>
                                    Respuesta #{ ix + 1 } - { new Date( submission.createdAt ).toLocaleString() }
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                { submission.User?.username && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Usuario: { submission.User.username }
                                    </Typography>
                                ) }
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    IP: { submission.ipaddress }
                                </Typography>

                                <List dense>
                                    { 
                                        submission.Answers
                                        .sort( ( a, b ) => a.Question.order - b.Question.order )
                                        .map( ( answer ) => (
                                            <ListItem key={ answer.id }>
                                                <ListItemText
                                                    primary={ answer.Question.label }
                                                    secondary={ answer.value }
                                                />
                                            </ListItem>
                                        ) )
                                    }
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    ) )
                ) }
            </Box>
        </MobileLayout>
    );
};

export default SurveyResponses;
