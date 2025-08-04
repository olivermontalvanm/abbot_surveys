import { 
    Box, Container, Divider, Paper, Stack, Typography, 
    /*Button,*/ IconButton, Tooltip
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import Select from "../components/inputs/Select";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { esES } from "@mui/x-date-pickers/locales";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import { fetchDashboardData, RootState } from "../store/store";
import { useAppDispatch } from "../hooks/hooks";
import { CatalogOption } from "../interfaces/Common";
import { useSelector } from "react-redux";
import { BarChart } from "@mui/x-charts";
import PieChart from "../components/PieChartB";
import { requestStatuses } from "../constants";

//  PDF generation
//import { usePDF } from "react-to-pdf";
import { /*FilterAlt, Print,*/ Settings } from "@mui/icons-material";

import { DashboardPayload } from "../services/Request";
import { Request } from "../interfaces/Models";
import Modal from "../components/Modal";
import TextInput from "../components/inputs/TextInput";
import ChartHelperC from "../utils/ChartHelper";
import { useSearchParams } from "react-router-dom";
import lodash from "lodash";

let ChartHelper = new ChartHelperC( { shoppingAnalysts: [ ], projects: [ ] } );

dayjs.locale( "es" );

interface Data {
    totalCount: number;
    inProgressCount: number;
    finishedCount: number;
    averageShoppingDays: number;
    pendingRequests: Request[ ],
    finishedRequests: Request[ ]
};

interface IFilters {
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    project: CatalogOption | null;
};

const InitialFilters: IFilters = { 
    startDate: null, 
    endDate: null,
    project: null
};

const InitialData: Data = {
    totalCount: 0,
    inProgressCount: 0,
    finishedCount: 0,
    averageShoppingDays: 0,
    pendingRequests: [ ],
    finishedRequests: [ ]
};

//"status" | "stage" | "assignee" | "priority" | "expiration" | "days" | "item" | "project"

export interface ChartConfig {
    type: "bar" | "pie",
    xAxis: CatalogOption;
    yAxis: CatalogOption;
    statuses: CatalogOption[ ],
    stages: CatalogOption[ ],
    assignee: CatalogOption[ ],
    projects: CatalogOption[ ],
    width: "50%" | "100%",
    label: string;
    id: number;
};

const ChartSettingsModal: FC<{ 
    settings: ChartConfig | null, 
    closeCallback: ( ) => void;
    saveCallback: ( newConfig: ChartConfig ) => void;
}> = ( { 
    settings, closeCallback, saveCallback
} ) => {
    if( !settings )
        return null;

    const chartTypes = [
        { id: "pie", label: "Pastel" },
        { id: "bar", label: "Barras" }
    ];
    const chartWidths = [ { id: "50%", label: "50%" }, { id: "100%", label: "100%" } ];

    const selectableStatuses = [ 
        Object.values( requestStatuses.costStatuses ),
        Object.values( requestStatuses.shoppingStatuses )
    ].flat( );

    const [ tempSettings, setTempSettings ] = useState<ChartConfig>( settings );

    const { shoppingAnalysts, projects } = useSelector( ( state: RootState ) => state.common );

    useEffect( ( ) => {
        switch( tempSettings.type ) {
            case "pie":
                if( tempSettings.width == "100%" )
                    setTempSettings( p => ( { ...p, width: "50%" } ) );
                break;
        }
    }, [ tempSettings.type ] );

    return (
        <Modal
            title="Configuración del gráfico"
            openModal={ tempSettings !== null }
            closeModal={( ) => { closeCallback( ); }}
            actions={[
                { 
                    label: "Cerrar", 
                    callback: closeCallback, 
                    sx: { backgroundColor: "transparent", border: "none", color: "gray" } 
                },
                { label: "Guardar", callback: ( ) => { saveCallback( tempSettings ); closeCallback( ); } }
            ]}
        >
            <Stack direction="column" gap="1rem">
                <Stack direction="column" gap="0">
                    <Typography sx={{ fontSize: "12px" }}>Titulo</Typography>
                    <TextInput
                        label=""
                        value={ tempSettings.label }
                        placeholder="Gráfico 1"
                        handleChange={ ( v ) => {
                            setTempSettings( p => ( { ...p, label: v } ) );
                        } }
                        sx={{ width: "100%" }}
                    />
                </Stack>
                <Select
                    options={ chartTypes }
                    value={ chartTypes.find( ct => ct.id == tempSettings.type )! }
                    handleChange={ e => {
                        setTempSettings( p => ( { ...p, type: ( e as CatalogOption ).id as "pie" | "bar" } ) );
                    }}
                    sx={{ marginTop: "0" }} 
                    disableClearable
                    label="Tipo"
                /> 
                <Select
                    options={ chartWidths }
                    value={ chartWidths.find( ct => ct.id == tempSettings.width )! }
                    handleChange={ e => {
                        setTempSettings( p => ( { ...p, width: ( e as CatalogOption ).id as "50%" | "100%" } ) );
                    }}
                    sx={{ marginTop: "0" }} 
                    disableClearable
                    label="Ancho"
                    disabled={ tempSettings.type != "bar" }
                />
                <Select
                    options={ ChartHelper.XAxisOptions }
                    value={ tempSettings.xAxis }
                    handleChange={ e => {
                        setTempSettings( p => ( { ...p, xAxis: e as CatalogOption } ) );
                    }}
                    sx={{ marginTop: "0" }} 
                    disableClearable
                    label="Eje X"
                />
                {
                    tempSettings.xAxis.id == "status" && (
                        <Select
                            options={ selectableStatuses }
                            value={ tempSettings.statuses }
                            handleChange={ e => {
                                setTempSettings( p => ( { ...p, statuses: e as CatalogOption[ ] } ) );
                            }}
                            sx={{ marginTop: "0", maxWidth: "320px" }} 
                            label="Estatus visibles"
                            multiple
                            disableCloseOnSelect
                        />
                    )
                }
                {
                    tempSettings.xAxis.id == "assignee" && (
                        <Select
                            options={ shoppingAnalysts }
                            value={ tempSettings.assignee }
                            handleChange={ e => {
                                setTempSettings( p => ( { ...p, assignee: e as CatalogOption[ ] } ) );
                            }}
                            sx={{ marginTop: "0", maxWidth: "320px" }} 
                            label="Responsables"
                            multiple
                            disableCloseOnSelect
                        />
                    )
                }
                {
                    tempSettings.xAxis.id == "project" && (
                        <Select
                            options={ projects }
                            value={ tempSettings.projects }
                            handleChange={ e => {
                                setTempSettings( p => ( { ...p, projects: e as CatalogOption[ ] } ) );
                            }}
                            sx={{ marginTop: "0", maxWidth: "320px" }} 
                            label="Proyectos"
                            multiple
                            disableCloseOnSelect
                        />
                    )
                }
                <Select
                    options={ ChartHelper.YAxisOptions }
                    value={ tempSettings.yAxis }
                    handleChange={ e => {
                        setTempSettings( p => ( { ...p, yAxis: e as CatalogOption } ) );
                    }}
                    sx={{ marginTop: "0" }} 
                    disableClearable
                    label="Eje Y"
                />
            </Stack>
        </Modal>
    );
};

const Dashboard: FC<{ isMobile: boolean; }> = ( ) => {
    const dispatch = useAppDispatch( );
    const [ searchParams, setSearchParams ] = useSearchParams( );

    const { 
        projects, shoppingAnalysts, 
        /*loggedUser*/ //   For PDF generation
    } = useSelector( ( state: RootState ) => state.common );

    const [ filters, setFilters ] = useState<IFilters>( InitialFilters );
    const [ data, setData ] = useState<Data>( InitialData );
    const [ charts, setCharts ] = useState<ChartConfig[ ]>( [
        {
            type: "bar", xAxis: ChartHelper.XAxisOptions[ 0 ], yAxis: ChartHelper.YAxisOptions[ 0 ], width: "100%", label: "Cantidad de pedidos activos por estatus", id: 0,
            statuses: [ ], stages: [ ], assignee: [ ], projects: [ ]
        },
        {
            type: "bar", xAxis: ChartHelper.XAxisOptions[ 4 ], yAxis: ChartHelper.YAxisOptions[ 0 ], width: "50%", label: "Cantidad de pedidos activos por proyecto", id: 1,
            statuses: [ ], stages: [ ], assignee: [ ], projects: [ ]
        },
        {
            type: "bar", xAxis: ChartHelper.XAxisOptions[ 1 ], yAxis: ChartHelper.YAxisOptions[ 0 ], width: "50%", label: "Cantidad de pedidos activos por responsable", id: 2,
            statuses: [ ], stages: [ ], assignee: [ ], projects: [ ]
        },
        {
            type: "pie", xAxis: ChartHelper.XAxisOptions[ 3 ], yAxis: ChartHelper.YAxisOptions[ 0 ], width: "100%", label: "Cantidad de pedidos activos por expiración", id: 3,
            statuses: [ ], stages: [ ], assignee: [ ], projects: [ ]
        },
        {
            type: "pie", xAxis: ChartHelper.XAxisOptions[ 2 ], yAxis: ChartHelper.YAxisOptions[ 0 ], width: "100%", label: "Cantidad de pedidos activos por prioridad", id: 4,
            statuses: [ ], stages: [ ], assignee: [ ], projects: [ ]
        }
    ] );
    const [ chartSettingsIx, setChartSettingsIx ] = useState<number | null>( null );
    const [ initialLoad, setInitialLoad ] = useState<boolean>( false );

    //  PDF generation
    //const [ pdfGenDate, setPdfGenDate ] = useState<Dayjs | null>( null );
    //const [ showPrintInfo, setShowPrintInfo ] = useState<boolean>( false );
    //const { toPDF, targetRef } = usePDF( { filename: "page.pdf", method: "open", page: { margin: 5 } } );

    const Chart: FC<{ settings: ChartConfig }> = ( { settings } ) => {
        let Component: FC = ( ) => null;

        const chartData = ChartHelper.getChartData( settings, data.pendingRequests );

        switch( settings.type ) {
            case "bar":
                Component = ( ) => (
                    <BarChart
                        xAxis={ [ { 
                            scaleType: "band", 
                            labelStyle: { fontSize: "4px", whiteSpace: "break-spaces", wordBreak: "break-word" },
                            data: chartData.xAxis.values
                        } ] }
                        yAxis={ [ { label: chartData.yAxis.label, position: "left" } ] }
                        barLabel={( i ) => `${ i.value }` }
                        borderRadius={4}
                        series={ [ { 
                            type: "bar", 
                            data: chartData.yAxis.values,
                            color: "#2980b9"
                        } ] }
                        height={300}
                    />
                );
                break;

            case "pie":
                Component = ( ) => (
                    <PieChart
                        /*data={ [
                            { label: "Normal", value: 300, color: "#2c3e50" },
                            { label: "Urgente", value: 20, color: "#EF5350" },
                            { label: "Retrasados", value: 80, color: "#FFB74D" }
                        ] }*/
                        data={
                            chartData.xAxis.values.map( ( x, ix ) => ( { 
                                label: x, 
                                value: chartData.yAxis.values[ ix ]
                            } ) )
                        }
                    />
                );
        }

        return (
            <Paper 
                elevation={0} 
                sx={{ 
                    boxSizing: "border-box", padding: "1rem", backgroundColor: "white !important", 
                    textAlign: "center", width: settings.type == "bar" ? settings.width : "50%", 
                    position: "relative", 
                    //border: showPrintInfo ? "none" : "dashed 1px black"
                    border: "dashed 1px black"
                }}
            >
                {
                    /*!showPrintInfo && */ (
                        <Tooltip title="Ajustar gráfico" placement="bottom" arrow>
                            <IconButton 
                                sx={{ position: "absolute", top: "1rem", right: "2rem" }}
                                onClick={( ) => {
                                    setChartSettingsIx( settings.id );
                                }}
                            ><Settings /></IconButton>
                        </Tooltip>
                    )
                }
                <Typography>{ settings.label }</Typography>
                <Component />
            </Paper>
        );
    };

    const parseFetchedData: ( param: DashboardPayload ) => typeof data = ( param: DashboardPayload ) => {
        const averageShoppingDays = (
            param.pendingRequests
            .filter( r => !!r )
            .map( r => r.shoppingElapsedDays )
            .reduce( ( acc, cv ) => acc! + cv!, 0 )
        ) as number;

        const parsedData: typeof data = {
            totalCount: param.requestCount, 
            inProgressCount: param.inProgressCount, 
            finishedCount: param.finishedRequestCount,
            averageShoppingDays,
            pendingRequests: param.pendingRequests,
            finishedRequests: param.finishedRequests
        };
        
        return parsedData;
    };
    
    useEffect( ( ) => {
        const queryParams: { [ key: string ]: string } = { };

        if( filters.startDate && filters.startDate.isValid( ) )
            queryParams[ "f_reqfrom"] = dayjs( filters.startDate ).format( "DD-MM-YYYY" );
        
        if( filters.endDate && filters.endDate.isValid( ) )
            queryParams[ "f_reqto"] = dayjs( filters.endDate ).format( "DD-MM-YYYY" );

        if( filters.project?.id )
            queryParams[ "f_project"] = filters.project.id!.toString( );

        setSearchParams( queryParams );

        if( initialLoad ) {
            const parsedFilters: {
                startDate?: string;
                endDate?: string;
                project?: number;
            } = { };
            
            if( filters.startDate && filters.startDate.isValid( ) )
                parsedFilters.startDate = filters.startDate.format( "YYYY-MM-DD HH:mm:ss" )
    
            if( filters.endDate && filters.endDate.isValid( ) )
                parsedFilters.endDate = filters.endDate.format( "YYYY-MM-DD HH:mm:ss" )
            
            if( filters.project ) 
                parsedFilters.project = filters.project.id ? Number( filters.project.id ) : undefined;
    
            dispatch( fetchDashboardData( { filters: parsedFilters } ) ).unwrap( )
            .then( r => {
                setData( parseFetchedData( r ) );
            } );    
        }
    }, [ initialLoad, filters ] );

    useEffect( ( ) => {
        if( initialLoad )
            localStorage.setItem( "chartsConfig", JSON.stringify( charts ) );
    }, [ charts ] );

    /*
    //  PDF Generation logic
    useEffect( ( ) => {
        if( pdfGenDate )
            setShowPrintInfo( true );
    }, [ pdfGenDate ] );
    */

    /*
    //  PDF generation logic
    useEffect( ( ) => {
        if( showPrintInfo ) {
            //  HACK nasty hack to show in print
            setTimeout( ( ) => {
                toPDF( ); //  Uncomment to trigger PDF generation
                setShowPrintInfo( false );    
            }, 1500 );
        }
    }, [ showPrintInfo ] );
    */

    useEffect( ( ) => {
        const fReqFrom = searchParams.get( "f_reqfrom" );
        const fReqTo  = searchParams.get( "f_reqto" );
        const fProjects = searchParams.get( "f_project" );

        const parsedReqFrom: Dayjs | null = fReqFrom ? dayjs( fReqFrom, "DD-MM-YYYY" ) : null;
        const parsedReqTo: Dayjs | null = fReqTo ? dayjs( fReqTo, "DD-MM-YYYY" ) : null;
        let parsedProjectId: number | null = Number( fProjects );
        let parsedProject: CatalogOption | null = null;

        if( !isNaN( parsedProjectId ) && parsedProjectId ) {
            parsedProject = { id: parsedProjectId, label: "" };
        } else {
            parsedProjectId = null;
        }

        setFilters( {
            startDate: parsedReqFrom,
            endDate: parsedReqTo,
            project: parsedProject
        } );

        //  Retrieve charts configuration
        const chartsConfigString = localStorage.getItem( "chartsConfig" );
        let parsedChartsConfig: typeof charts | null;

        if( chartsConfigString ) {
            parsedChartsConfig = JSON.parse( chartsConfigString ) as typeof charts;
            let isConfigEqual = true;

            if( parsedChartsConfig?.length ) {
                for( const chartConfig of parsedChartsConfig ) {
                    isConfigEqual = lodash.isEqual( chartConfig, charts.find( c => c.id == chartConfig.id ) );

                    if( !isConfigEqual )
                        break;
                }

                if( !isConfigEqual ) {
                    setCharts( parsedChartsConfig );
                }
            }
        }
        
        setInitialLoad( true );
    }, [ ] );
    
    useEffect( ( ) => {
        ChartHelper = new ChartHelperC( {
            shoppingAnalysts,
            projects
        } );

        if( projects?.length && filters?.project ) {
            const matchingProject = projects.find( p => ( filters.project! ).id == p.id );

            if( matchingProject ) {
                setFilters( f => ( { 
                    ...f, project: { 
                        id: matchingProject?.id, 
                        label: matchingProject?.label 
                    } 
                } ) );
            }
        }
    }, [ shoppingAnalysts, projects ] );

    //  TODO
    /**
     * - Hacer una versión funcional de cada tipo de gráfico
     * - Obtener todas las variables independientes (X)
     * - Obtener todas las variables dependientes (Y)
     * - Realizar la asociación a nivel de front-end
     */

    return (
        <Container maxWidth="xl" sx={{ display: "flex", flexFlow: "column", gap: "1rem", margin: "auto", padding: "1rem" }}>
            <ChartSettingsModal 
                settings={ chartSettingsIx != null ? charts[ chartSettingsIx ] : null }
                closeCallback={( ) => { setChartSettingsIx( null ); }}
                saveCallback={ ( newConfig ) => {
                    if( chartSettingsIx == null )
                        return;

                    const newCharts = Object.assign( [ ], charts ) as typeof charts;

                    newCharts[ chartSettingsIx ] = newConfig;
                    
                    setCharts( newCharts );
                } }
            />
            <Paper sx={{ padding: "1rem" }} elevation={2}>
                <Stack direction="row" gap="1rem" alignItems="flex-end">
                    <Stack direction="column">
                        <Typography variant="body2">Pedidos desde</Typography>
                        <LocalizationProvider dateAdapter={ AdapterDayjs } localeText={ esES.components.MuiLocalizationProvider.defaultProps.localeText }>
                            <DatePicker 
                                value={ filters.startDate } 
                                onChange={ val => {
                                    let targetDate = InitialFilters.startDate;

                                    if( val )
                                        targetDate = val;

                                    setFilters( f => ( { ...f, startDate: targetDate } ) );
                                } } 
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'inherit !important',
                                            border: "none"
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'inherit !important',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'inherit !important',
                                        }
                                    },
                                    '& .MuiButtonBase-root': {
                                        outline: "none"
                                    },
                                    border: `solid 1px rgba( 0, 0, 0, 0.3 )`,
                                    borderRadius: "3px",
                                    height: "38px"
                                }} 
                                slotProps={{
                                    day: { sx: { backgroundColor: "transparent !important", color: "black !important" } }
                                }} 
                                closeOnSelect 
                                format="DD/MM/YYYY"
                                maxDate={ filters.endDate ?? undefined }
                            />
                        </LocalizationProvider>
                    </Stack>
                    <Divider orientation="vertical" sx={{ height: "50px" }} />
                    <Stack direction="column">
                        <Typography variant="body2">Pedidos hasta</Typography>
                        <LocalizationProvider dateAdapter={ AdapterDayjs } localeText={ esES.components.MuiLocalizationProvider.defaultProps.localeText }>
                            <DatePicker 
                                value={ filters.endDate } 
                                onChange={( val ) => {
                                    let targetDate = InitialFilters.endDate;

                                    if( val )
                                        targetDate = val;

                                    setFilters( f => ( { ...f, endDate: targetDate } ) );
                                } } 
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'inherit !important',
                                            border: "none"
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'inherit !important',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'inherit !important',
                                        }
                                    },
                                    '& .MuiButtonBase-root': {
                                        outline: "none"
                                    },
                                    border: `solid 1px rgba( 0, 0, 0, 0.3 )`,
                                    borderRadius: "3px",
                                    height: "38px"
                                }} 
                                slotProps={{
                                    day: { sx: { backgroundColor: "transparent !important", color: "black !important" } }
                                }} 
                                closeOnSelect 
                                format="DD/MM/YYYY"
                                maxDate={ dayjs( ) }
                            />
                        </LocalizationProvider>
                    </Stack>
                    <Divider orientation="vertical" sx={{ height: "50px" }} />
                    <Select
                        options={ projects }
                        value={ filters.project }
                        handleChange={ val => {
                            setFilters( f => ( { ...f, project: val as CatalogOption | null } ) );
                        } }
                        sx={{ marginTop: "0", maxWidth: "250px" }} 
                        noSelectionText="-- Todos --"
                        label="Proyecto"
                    /> 
                    {/*
                    //  PDF generation logic
                    <Divider orientation="vertical" sx={{ height: "50px" }} />
                    <Stack direction="column" gap="0.5rem">
                        <Button
                            onClick={( ) => {
                                setPdfGenDate( dayjs( ) );
                            }}
                            variant="outlined" 
                            sx={{ height: "40px" }}
                        >Reestablecer <IconButton><FilterAlt /></IconButton></Button>
                        <Button
                            onClick={( ) => {
                                setPdfGenDate( dayjs( ) );
                            }}
                            variant="outlined" 
                            sx={{ height: "40px" }}
                        >Imprimir <IconButton><Print /></IconButton></Button>
                    </Stack>
                    */}
                </Stack>
            </Paper>
            <div /*ref={ targetRef }*/>
                {/*
                    //  PDF generation logic
                    showPrintInfo && pdfGenDate && (
                        <Stack direction="column" sx={{ border: "dashed 1px black", padding: "1rem", alignItems: "center" }}>
                            <Stack direction="row" alignContent="center">
                                <Typography fontWeight={600}>Sistema de Seguimiento de Pedidos de Material</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-around" sx={{ width: "100%" }}>
                                <Stack direction="column">
                                    <Typography fontWeight="500">Sobre este reporte</Typography>
                                    <Typography>Generado el { pdfGenDate?.format( "DD/MM/YYYY") ?? "-" } a las { pdfGenDate?.format( "HH:mm:ss a" ) ?? "-" }</Typography>
                                    <Typography>Usuario: { loggedUser?.username ?? "" }</Typography>
                                </Stack>
                                <Stack direction="column">
                                    <Typography fontWeight="500">Criterio aplicado</Typography>
                                    {
                                        ( !filters.startDate && !filters.endDate && filters.project?.id == null ) && (
                                            <Typography>Ninguno</Typography>
                                        )
                                    }
                                    {
                                        filters.startDate && (
                                            <Typography>Pedidos desde: { filters.startDate.format( "DD/MM/YYYY" ) }</Typography>
                                        )
                                    }
                                    {
                                        filters.endDate && (
                                            <Typography>Pedidos hasta: { filters.endDate.format( "DD/MM/YYYY" ) }</Typography>
                                        )
                                    }
                                    {
                                        filters.project?.id && (
                                            <Typography>Proyecto: { filters.project?.label }</Typography>
                                        )
                                    }
                                </Stack>
                            </Stack>
                        </Stack>
                    )
                */}
                <Paper
                    elevation={3} 
                    sx={{
                        backgroundColor: "white !important", textAlign: "center", boxSizing: "border-box", 
                        padding: "1rem", display: "flex", justifyContent: "center", flexFlow: "column",
                        margin: "1rem 0"
                    }}
                >
                    <Stack direction="row" display="grid" gridTemplateColumns="24% 10px 24% 10px 24% 10px 24%">
                        <Box>
                            <Typography fontSize={28}>{ data.totalCount }</Typography>
                            <Typography>Pedidos Totales</Typography>
                        </Box>
                        <Divider orientation="vertical" />
                        <Box>
                            <Typography fontSize={28}>{ data.inProgressCount }</Typography>
                            <Typography>Pedidos pendientes</Typography>
                        </Box>
                        <Divider orientation="vertical" />
                        <Box>
                            <Typography fontSize={28}>{ data.finishedCount }</Typography>
                            <Typography>Pedidos finalizados</Typography>
                        </Box>
                        <Divider orientation="vertical" />
                        <Box>
                            <Typography fontSize={28}>{ data.averageShoppingDays }</Typography>
                            <Typography>Días promedio en compras</Typography>
                        </Box>
                    </Stack>
                </Paper>
                <Paper elevation={3}>
                    <Stack direction="row" flexWrap={"wrap"} flexGrow={1}>
                        <Chart settings={ charts[ 0 ] } />
                        <Chart settings={ charts[ 1 ] } />
                        <Chart settings={ charts[ 2 ] } />
                        <Chart settings={ charts[ 3 ] } />
                        <Chart settings={ charts[ 4 ] } />
                        {/*<Paper elevation={0} sx={{ boxSizing: "border-box", padding: "1rem", backgroundColor: "white !important", textAlign: "center", width: "50%" }}>
                            <Typography>Cantidad de pedidos pendientes por estatus</Typography>
                            <BarChart
                                xAxis={[{ 
                                    scaleType: "band", 
                                    labelStyle: { fontSize: "4px", whiteSpace: "break-spaces", wordBreak: "break-word" },
                                    data: [
                                        //  Costos
                                        ...Object.values( requestStatuses.costStatuses ).map( r => r.label ),
                                        //  Compras
                                        ...Object.values( requestStatuses.shoppingStatuses ).map( r => r.label )
                                    ]
                                }]}
                                yAxis={[{ label: "Cantidad", position: "left" }]}
                                //barLabel={( i ) => `${ i.value }` }
                                borderRadius={4}
                                series={[{ 
                                    type: "bar", 
                                    data: ChartHelper.getRequestsByStatus( 
                                        data.pendingRequests, 
                                        [ 
                                            Object.values( requestStatuses.costStatuses ).map( s => s.id ), 
                                            Object.values( requestStatuses.shoppingStatuses ).map( s => s.id ) 
                                        ].flat( ) 
                                    )
                                }]}
                                height={300}
                            />
                        </Paper>
                        <Paper elevation={0} sx={{ boxSizing: "border-box", padding: "1rem", backgroundColor: "white !important", textAlign: "center", width: "50%" }}>
                            <Typography>Pedidos por estatus</Typography>
                            <BarChart
                                dataset={[
                                    {
                                        reviewed: 10,
                                        pending: 14,
                                        stage: "Revisión"
                                    },
                                    {
                                        reviewed: 10,
                                        pending: 14,
                                        stage: "Pendiente"
                                    },
                                    {
                                        reviewed: 10,
                                        pending: 14,
                                        stage: "Listo"
                                    },
                                    {
                                        reviewed: 10,
                                        pending: 14,
                                        stage: "Finalizado"
                                    }
                                ]}
                                xAxis={[{ dataKey: "stage", scaleType: "band", label: "Estatus" }]}
                                series={[
                                    { dataKey: "reviewed", label: "Revisado", valueFormatter: val => `${ val }` },
                                    { dataKey: "pending", label: "Pendiente de revisión", valueFormatter: val => `${ val }` },
                                ]}
                                yAxis={[
                                    {
                                        label: 'Cantidad'
                                    },
                                ]}
                                height={300}
                        />
                        </Paper>
                        <Paper elevation={0} sx={{ boxSizing: "border-box", padding: "1rem", backgroundColor: "white !important", textAlign: "center", width: "50%" }}>
                            <Typography variant="header2">Resumen de pedidos</Typography>
                            <PieChart
                                data={ [
                                    { label: "En progreso", value: 200, color: "#2980b9" },
                                    { label: "Pendientes", value: 200, color: "#2c3e50" },
                                ] }
                            />
                        </Paper>
                        <Paper elevation={0} sx={{ boxSizing: "border-box", padding: "1rem", backgroundColor: "white !important", textAlign: "center", width: "50%" }}>
                            <Typography>Pedidos en progreso por prioridad</Typography>
                            <PieChart
                                data={ [
                                    { label: "Normal", value: 300, color: "#2c3e50" },
                                    { label: "Urgente", value: 20, color: "#EF5350" },
                                    { label: "Retrasados", value: 80, color: "#FFB74D" }
                                ] }               
                            />
                        </Paper>
                        <Paper elevation={0} sx={{ boxSizing: "border-box", padding: "1rem", backgroundColor: "white !important", textAlign: "center", width: "50%" }}>
                            <Typography>Pedidos en progreso por prioridad</Typography>
                            <PieChart
                                data={ [
                                    { label: "Normal", value: 300, color: "#2c3e50" },
                                    { label: "Urgente", value: 20, color: "#EF5350" },
                                    { label: "Retrasados", value: 80, color: "#FFB74D" }
                                ] }               
                            />
                        </Paper>
                        <Paper elevation={0} sx={{ boxSizing: "border-box", padding: "1rem", backgroundColor: "white !important", textAlign: "center", width: "50%" }}>
                            <Typography>Pedidos en progreso por prioridad</Typography>
                            <PieChart
                                data={ [
                                    { label: "Normal", value: 300, color: "#2c3e50" },
                                    { label: "Urgente", value: 20, color: "#EF5350" },
                                    { label: "Retrasados", value: 80, color: "#FFB74D" }
                                ] }               
                            />
                        </Paper>
                        <Paper elevation={0} sx={{ boxSizing: "border-box", padding: "1rem", backgroundColor: "white !important", textAlign: "center", width: "50%" }}>
                            <Typography>Pedidos en progreso por prioridad</Typography>
                            <PieChart
                                data={ [
                                    { label: "Normal", value: 300, color: "#2c3e50" },
                                    { label: "Urgente", value: 20, color: "#EF5350" },
                                    { label: "Retrasados", value: 80, color: "#FFB74D" }
                                ] }               
                            />
                        </Paper>
                        <Paper elevation={0} sx={{ boxSizing: "border-box", padding: "1rem", backgroundColor: "white !important", textAlign: "center", width: "50%" }}>
                            <Typography>Pedidos en progreso por prioridad</Typography>
                            <PieChart
                                data={ [
                                    { label: "Normal", value: 300, color: "#2c3e50" },
                                    { label: "Urgente", value: 20, color: "#EF5350" },
                                    { label: "Retrasados", value: 80, color: "#FFB74D" }
                                ] }               
                            />
                        </Paper>
                        <Paper elevation={0} sx={{ boxSizing: "border-box", padding: "1rem", backgroundColor: "white !important", textAlign: "center", width: "50%" }}>
                            <Typography>Pedidos en progreso por prioridad</Typography>
                            <PieChart
                                data={ [
                                    { label: "Normal", value: 300, color: "#2c3e50" },
                                    { label: "Urgente", value: 20, color: "#EF5350" },
                                    { label: "Retrasados", value: 80, color: "#FFB74D" }
                                ] }               
                            />
                        </Paper>
                        <Paper elevation={0} sx={{ boxSizing: "border-box", padding: "1rem", backgroundColor: "white !important", textAlign: "center", width: "50%" }}>
                            <Typography>Pedidos en progreso por prioridad</Typography>
                            <PieChart
                                data={ [
                                    { label: "Normal", value: 300, color: "#2c3e50" },
                                    { label: "Urgente", value: 20, color: "#EF5350" },
                                    { label: "Retrasados", value: 80, color: "#FFB74D" }
                                ] }               
                            />
                        </Paper>*/}
                    </Stack>
                </Paper>
            </div>
        </Container>
    );
}

export default Dashboard;
