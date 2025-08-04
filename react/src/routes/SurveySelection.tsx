import { Card, CardActionArea, CardContent, Typography, Grid, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MobileLayout from "../layouts/MobileLayout";
import { useAppDispatch } from '../hooks/hooks';
import { useEffect, useState } from 'react';
import { getSurveys, RootState } from '../store/store';
import { useSelector } from 'react-redux';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DoctorImage from "../assets/doctor.png";
import Hospitalmage from "../assets/hospital.png";

export default function SurveyList() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [surveys, setSurveys] = useState([]);

    const handleSelect = (id: string) => {
        navigate(`/surveys/${id}`);
    };

    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

        if (!loggedUser) {
            window.location.assign("/login");
        }

        dispatch(getSurveys()).unwrap().then(e => {
            setSurveys(e);
        });
    }, []);

    const icons = [ Hospitalmage, DoctorImage ];

    return (
        <MobileLayout>
            <Grid container spacing={3} padding={4}>
                {surveys.map((survey, six) => (
                    <Grid item xs={12} sm={6} md={4} key={survey.id}>
                        <Card
                            elevation={3}
                            sx={{
                                borderRadius: 2
                            }}
                        >
                            <CardActionArea onClick={() => handleSelect(survey.id)}>
                                <CardContent sx={{ backgroundColor: "#ffffff", height: "140px" }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography component="div" sx={{ color: '#1e4479', fontSize: "18px", fontWeight: "500" }}>
                                            {survey.title}
                                        </Typography>
                                        <img src={ icons[ six ] } height="80px" alt="" />
                                    </Stack>                
                                    <Stack direction="row" justifyContent="center">
                                        <Typography
                                            sx={{
                                                mt: 2,
                                                color: '#fff',
                                                fontWeight: 600,
                                                textTransform: "capitalize",
                                                borderRadius: 1,
                                                backgroundColor: "#00b5f0",
                                                padding: "0.25rem 2rem"
                                            }}
                                        >
                                            INGRESAR
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </MobileLayout>
    );
}
