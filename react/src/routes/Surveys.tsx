import { ElementType, FC, useEffect, useState } from "react";
import { Routes, Route, useParams } from 'react-router-dom';

import DesktopLayout from "../layouts/DesktopLayout";
import MobileLayout from "../layouts/MobileLayout";
import Requests from "../pages/Requests";
import Dashboard from "../pages/Dashboard";
//import RequestDetail from "../features/requests/RequestDetail";
import { useAppDispatch, useWindowSize } from "../hooks/hooks";
import { fetchAllItemsOptions, fetchAllMeasureUnits, getShoppingAnalistOptions, getSurveys } from "../store/store";
import DynamicSurveyForm from "./DynamicSurveyForm";

const Orders: FC = ( ) => {
    const dispatch = useAppDispatch( );
    const { id } = useParams( );
	
    const [ windowSize ] = useWindowSize( );
    const [ isMobile, setIsMobile ] = useState<boolean>( false );
    const [ surveys, setSurveys ] = useState( [ ] );

    useEffect( ( ) => {
        dispatch( getSurveys( ) ).unwrap( ).then( e => {
            setSurveys( e );
        } );
        console.debug( { id } );
    }, [ ] );

    useEffect( ( ) => {
        setIsMobile( window.mobileCheck( ) );
    }, [ windowSize ] );

    const Layout: ElementType = MobileLayout;

    return (
        <Layout>
            <div>
                { surveys.map( s => (
                    <DynamicSurveyForm key={ s[ "id" ] } survey={ s } />
                ) )}
            </div>
        </Layout>
    );
};

export default Orders;
