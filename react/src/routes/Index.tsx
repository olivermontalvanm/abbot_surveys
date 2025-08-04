import { FC } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "../pages/Login";
import OrdersRouter from "./Surveys";
import SurveySelection from "./SurveySelection";
import DynamicSurveyForm from "./DynamicSurveyForm";
import SurveyResponses from "./SurveyResponses";

const AppRoutes: FC = () => {
    return (
        <Routes>
            {/** Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
			
            {/** Modules */}
            <Route path="/login" element={<Login />} />
            <Route path="/surveys" element={ <SurveySelection /> } />
            <Route path="/surveys/:surveyid" element={ <DynamicSurveyForm /> } />
            <Route path="/surveys/:surveyid/replies" element={ <SurveyResponses /> } />
        </Routes>
    );
};

export default AppRoutes;
