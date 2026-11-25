import { FC } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "../pages/Login";
import OrdersRouter from "./Surveys";
import SurveySelection from "./SurveySelection";
import DynamicSurveyForm from "./DynamicSurveyForm";
import SurveyResponses from "./SurveyResponses";
import VisitsSearch from "./VisitsSearch";
import VisitsForm from "./VisitsForm";
import VisitResponses from "./VisitResponses";
import SpecialActivitiesForm from "./SpecialActivitiesForm";
import SpecialActivityResponses from "./SpecialActivityResponses";

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
            <Route path="/forms/visits" element={ <VisitsSearch /> } />
            <Route path="/forms/visits/:submissionId" element={ <VisitsForm /> } />
            <Route path="/replies/visits" element={ <VisitResponses /> } />
            <Route path="/forms/special-activities" element={ <SpecialActivitiesForm /> } />
            <Route path="/replies/special-activities" element={ <SpecialActivityResponses /> } />
        </Routes>
    );
};

export default AppRoutes;
