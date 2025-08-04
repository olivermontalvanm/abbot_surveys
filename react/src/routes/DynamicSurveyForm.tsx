import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
    Stack, Snackbar, Alert
} from "@mui/material";
import { useAppDispatch } from "../hooks/hooks";
import { getLoggedUser, getSurveys, postSurvey } from "../store/store";
import { useParams } from "react-router-dom";
import MobileLayout from "../layouts/MobileLayout";

// Define types
type Option = {
    id: number;
    label: string;
    value: string;
};

type Question = {
    id: number;
    label: string;
    type: "TEXT" | "NUMBER" | "SINGLE_OPTION";
    minvalue: number | null;
    maxvalue: number | null;
    visible: boolean;
    required: boolean;
    Options: Option[];
};

type Survey = {
    id: number;
    title: string;
    Questions: Question[];
};

type Props = { };

const DynamicSurveyForm: React.FC<Props> = () => {
    const dispatch = useAppDispatch();
    const { surveyid } = useParams( );

    const [formData, setFormData] = useState<Record<number, string | number>>({});
    const [ survey, setSurvey ] = useState<never[ ]>( [ ] );
    const [ toast, setToast ] = useState( { open: false, message: "" } );
    const [ loggedUser, setLoggedUser ] = useState<never|null>( null );

    const handleChange = (questionId: number, value: string | number) => {
        setFormData((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // You could POST formData here to your backend
        dispatch( postSurvey( { data: formData, surveyid: (survey as never)["id"] } ) ).unwrap( ).then( ( ) => {
            setToast( { open: true, message: "Datos enviados con éxito" } );
            setFormData( {} );
        } );
    };

    useEffect(() => {
        const user = JSON.parse( localStorage.getItem( "loggedUser" ) );

        if( user ) {
            setLoggedUser( user );
        } else {
            window.location.assign( "/login" );
        }    
        
        dispatch(getSurveys()).unwrap().then(e => {
            const s = ( e as { id: number }[ ] ).find( e => e.id == ( surveyid ?? 0 ) );
            
            if( s ) {
                setSurvey( s as never );
            }
        });
    }, []);

    if( !survey || survey.length == 0 )
        return null;

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
                <Button onClick={ ( ) => window.location.assign( "/surveys" )}>&lt; Volver</Button>
                {
                    ( loggedUser && loggedUser["role"] == "admin" ) && (
                        <Button onClick={ ( ) => window.location.assign( `${ window.location.pathname }/replies` )}>Ver respuestas &gt;</Button>
                    )
                }
            </Stack>
            <Box component="form" onSubmit={handleSubmit} 
                sx={{ 
                    maxWidth: 600, margin: "auto", mx: "auto", p: 6, m: 2, 
                    boxSizing: "border-box", backgroundColor: "#ffffff", borderRadius: 3,
                    boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.4)"
                }}>
                <Typography variant="h5" fontWeight={500} color="#1e4479" gutterBottom>{survey.title}</Typography>
                <Stack spacing={2}>
                    {survey.Questions.filter(q => q.visible).map((q) => {
                        const value = formData[q.id] ?? "";

                        if (q.type === "TEXT" || q.type === "NUMBER") {
                            return (
                                <TextField
                                    key={q.id}
                                    label={q.label}
                                    type={q.type === "NUMBER" ? "number" : "text"}
                                    required={q.required}
                                    value={value}
                                    onChange={(e) => handleChange(q.id, q.type === "NUMBER" ? +e.target.value : e.target.value)}
                                    InputProps={{
                                        inputProps: {
                                            min: q.minvalue ?? undefined,
                                            max: q.maxvalue ?? undefined
                                        }
                                    }}
                                    fullWidth
                                    sx={{ backgroundColor: "#ffffff" }}
                                />
                            );
                        }

                        if (q.type === "SINGLE_OPTION") {
                            return (
                                <TextField
                                    key={q.id}
                                    select
                                    label={q.label}
                                    required={q.required}
                                    value={value}
                                    onChange={(e) => handleChange(q.id, e.target.value)}
                                    fullWidth
                                    InputProps={ {
                                        sx: { height: "40px"  } 
                                    } }
                                    sx={{ backgroundColor: "#ffffff", height: "40px" }}
                                >
                                    {q.Options.map((opt) => (
                                        <MenuItem key={opt.id} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            );
                        }

                        return null; // fallback
                    })}
                    <Stack direction="column" gap="1rem" width="300px" alignSelf="center" justifyContent="center">
                        <Button sx={{ backgroundColor: "#00b5f0" }} type="submit" variant="contained">Enviar</Button>
                        <Button variant="contained" color="inherit" onClick={ ( ) => setFormData( {} )}>Limpiar</Button>
                    </Stack>
                </Stack>
            </Box>
        </MobileLayout>
    );
};

export default DynamicSurveyForm;
