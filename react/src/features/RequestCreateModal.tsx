import { FC, Fragment, useEffect, useState } from "react";
import Modal from "../components/Modal";
import { fetchAllMeasureUnits, RootState } from "../store/store";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../hooks/hooks";
import { createRequest as createRequestThunk, toggleSnackbar, fetchAllItemsOptions, checkRequestExists } from "../store/store";
import TextInput from "../components/inputs/TextInput";
import Select from "../components/inputs/Select";
import { CatalogOption } from "../interfaces/Common";
import { Box, Paper, Button, Typography, IconButton, Stepper, Step, StepLabel, Stack } from "@mui/material";
import { Close, Delete as DeleteIcon } from "@mui/icons-material";
import { Project } from "../interfaces/Models";
import EmptyImage from "../assets/empty-image.png";
import Switch from "../components/inputs/Switch";

const initialFormData = {
    requestNumber: "",
    selectedProjectOption: null,
    selectedActivity: null,
    selectedMaterials: [ ]
};

const mobileSteps = [
    { label: "Información", order: 0, finalStep: false },
    { label: "Materiales", order: 1, finalStep: true }
];

const RequestCreateModal: FC<{ 
    opened: boolean; toggler: ( status: boolean ) => void; 
    onCreate?: ( ) => void; mobile?: boolean;
}> = ( { opened, toggler, onCreate, mobile = false } ) => {
    const dispatch = useAppDispatch( );

    const { loggedUser, items, measureUnits } = useSelector( ( state: RootState ) => state.common );

    const [ formData, setFormData ] = useState<{
        requestNumber: string; selectedProjectOption: CatalogOption | null;
        selectedActivity: CatalogOption | null; 
        selectedMaterials: { item: CatalogOption | null; quantity: string; measureUnit: CatalogOption | null; isUrgent: boolean; }[ ];
    }>( initialFormData );
    
    const [ selectedProject, setSelectedProject ] = useState<Project | null>( null );
    const [ canCreate, setCanCreate ] = useState<boolean>( false );
    const [ loading, setLoading ] = useState<boolean>( false );
    const [ currentStep, setCurrentStep ] = useState<typeof mobileSteps[ 0 ]>( mobileSteps[ 0 ] );
    const [ inputErrors, setInputErrors ] = useState<{ [ key: string ]: string }>( { } );
    const [ reqExists, setReqExists ] = useState<boolean>( false );

    useEffect( ( ) => {
    }, [ ] );

    useEffect( ( ) => {
        if( loggedUser?.projects?.length ) {
            if( !selectedProject ) {
                const firstProject = loggedUser?.projects[ 0 ];
                setFormField( "selectedProjectOption", { id: firstProject.id, label: firstProject.title } );

                //  First project has activities
                if( firstProject.activities.length ) {
                    const firstActivity = firstProject.activities[ 0 ];
                    setFormField( "selectedActivity", { id: firstActivity.id, label: firstActivity.title } );
                }
            }
        }
    }, [ loggedUser?.projects ] );

    useEffect( ( ) => {
        if( formData.selectedProjectOption ) {
            const project = loggedUser?.projects?.find( p => formData.selectedProjectOption?.id == p.id );

            if( project ) {
                setSelectedProject( project );

                //  Activity selection is a known option (selected from list items)
                if( formData.selectedActivity?.label && formData.selectedActivity?.id ) {
                    if( project.activities.length ) {
                        const firstProjectActivity = project.activities[ 0 ];
                        setFormField( "selectedActivity", { id: firstProjectActivity.id, label: firstProjectActivity.title } );
                    } else {
                        setFormField( "selectedActivity", null );
                    }
                }
            } else {
                console.error( "An error occurred while setting the selected project" );
            }
        }
    }, [ formData.selectedProjectOption ] );

    useEffect( ( ) => {
        if( typeof formData.selectedActivity == "string" && formData.selectedActivity == "" ) {
            const firstActivity = selectedProject?.activities[ 0 ];
            setFormField( "selectedActivity", { id: firstActivity?.id, label: firstActivity?.title } );
        }
    }, [  formData.selectedActivity ] );

    useEffect( ( ) => {
        setCanCreate( validateFields( ) );
    }, [ reqExists ] );
    
    useEffect( ( ) => {
        setCanCreate( validateFields( ) );
    }, [ formData.selectedProjectOption, formData.selectedActivity, formData.requestNumber, formData.selectedMaterials ] )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setFormField = ( key: keyof typeof formData, value: any ) => {
        setFormData( prev => ( { ...prev, [ key ]: value } ) );
    };

    const validateFields: ( ) => boolean = ( ) => {
        const { requestNumber, selectedProjectOption, selectedActivity, selectedMaterials } = formData;
        
        if( !selectedProjectOption || !selectedActivity || !requestNumber || !selectedMaterials.length )
            return false;

        if( reqExists )
            return false;

        return true;
    };

    const resetAllFields = ( ) => {
        setCanCreate( false );

        setFormField( "requestNumber", "" );
        setFormField( "selectedMaterials", [ ] );

        if( loggedUser?.projects.length )
            setSelectedProject( loggedUser?.projects[ 0 ] );

        if( loggedUser?.projects[ 0 ].activities.length ) {
            const { id, title: label } = loggedUser.projects[ 0 ].activities[ 0 ];
            setFormField( "selectedActivity", { id, label } );
        }
    };

    const handleClose = ( ) => {
        setCurrentStep( mobileSteps[ 0 ] );
        toggler( false );
        resetAllFields( );
    };

    const handleRequestCreate = async ( ) => {
        setLoading( true );

        if( 
            !formData.requestNumber || !selectedProject || !formData.selectedActivity || !formData.selectedMaterials.length ||
            formData.selectedMaterials.some( m => !m.item ) ||
            formData.selectedMaterials.some( m => !m.measureUnit ) ||
            formData.selectedMaterials.some( m => !m.quantity )
        ) {
            setLoading( false );
            return false;
        }

        const requestMaterials = formData.selectedMaterials.map( sm => ( {
            item: sm.item!,
            measureUnit: sm.measureUnit!,
            quantity: sm.quantity!,
            isUrgent: sm.isUrgent
        } )  );

        const newRequest = { 
            items: requestMaterials, activity: formData.selectedActivity,
            project: { id: selectedProject.id, label: selectedProject.title },
            requestNumber: formData.requestNumber
        };

        dispatch( createRequestThunk( newRequest ) )
        .then( r => {
            if( r.meta.requestStatus == "fulfilled" ) {
                handleClose( );

                dispatch( toggleSnackbar( { message: "Solicitud creada", type: "success" } ) );

                if( onCreate )
                    onCreate( );
            }
        } )
        .catch( e => {
            console.error( e );
        } )
        .finally( ( ) => {
            setLoading( false );
        } );
    };

    const changeMobileStep = ( direction: "next" | "previous" ) => ( ) => {
        if( direction == "next" ) {
            setCurrentStep( mobileSteps.find( s => s.order == 1 )! );
        } else {
            setCurrentStep( mobileSteps.find( s => s.order == 0 )! );
        }
    };

    if( mobile ) {
        let modalActions;

        if( currentStep.finalStep ) {
            modalActions = [
                { label: "Anterior", callback: changeMobileStep( "previous" ), disabled: loading },
                { label: "Guardar", callback: handleRequestCreate, disabled: !canCreate || loading },
            ];
        } else {
            modalActions = [
                { label: "Cerrar", callback: ( ) => handleClose( ), disabled: loading },
                { label: "Siguiente", callback: changeMobileStep( "next" ), disabled: loading || !formData.requestNumber || !formData.selectedProjectOption || !formData.selectedActivity },
            ];
        }

        return (
            <Modal
                openModal={ opened }
                closeModal={ ( ) => handleClose( ) }
                title={ "Agregar solicitud de material" }
                actions={ modalActions }
                fullScreen
            >
                <Stepper activeStep={ mobileSteps.find( s => currentStep.order == s.order )?.order } sx={{ marginBottom: "1rem" }}>
                    <Step><StepLabel>Información</StepLabel></Step>
                    <Step><StepLabel>Materiales</StepLabel></Step>
                </Stepper>
                <Stack direction="column" justifyItems="center" gap="1rem">
                    {
                        currentStep.order == 0 && (
                            <Fragment>
                                <TextInput 
                                    disabled={ loading } 
                                    label="Número de Pedido" 
                                    sx={{ width: "100%" }} 
                                    value={ formData.requestNumber } 
                                    handleChange={ v => setFormField( "requestNumber", v ) } 
                                    placeholder="17617" 
                                    disableSelectOnFocus
                                />
                                <Select 
                                    value={ formData.selectedProjectOption } 
                                    label="Proyecto" 
                                    options={ loggedUser?.projects?.map( p => ( { id: p.id, label: p.title } ) ) ?? [ ] } 
                                    handleChange={ v => setFormField( "selectedProjectOption", v ) } 
                                    noOptionsText="No hay datos"
                                    disableClearable
                                    disabled={ loading }
                                    sx={{ width: "100%" }}
                                    preventFocusSelection
                                />
                                <Select 
                                    value={ formData.selectedActivity } 
                                    label="Actividad" 
                                    options={ selectedProject?.activities?.map( a => ( { id: a.id, label: a.title } ) ) ?? [ ] } 
                                    handleChange={ v => setFormField( "selectedActivity", v ) } 
                                    noOptionsText="No hay datos"
                                    disableClearable
                                    allowUnknown
                                    highlightUnknown
                                    noSelectionText=""
                                    disabled={ loading || !formData.selectedProjectOption }
                                    sx={{ width: "100%" }}
                                />
                            </Fragment>
                        )
                    }
                    {
                        currentStep.order == 1 && (
                            <Fragment>
                                {
                                    formData.selectedMaterials.map( ( sm, i ) => (
                                        <Stack direction="column" border="solid 1px black" boxSizing="border-box" padding="0.5rem" borderRadius="16px" gap="0.25rem" key={ i }>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography>Item #{ i + 1 }</Typography>
                                                <IconButton
                                                    onClick={ ( ) => {
                                                        const newMaterials = ( Object.assign( [ ], formData.selectedMaterials ) ) as typeof formData.selectedMaterials;

                                                        newMaterials.splice( i, 1 );

                                                        setFormField( "selectedMaterials", newMaterials );
                                                    }}
                                                    sx={{
                                                        "&:focus": {
                                                            outline: "none"
                                                        }
                                                    }}
                                                >
                                                    <Close />
                                                </IconButton>
                                            </Stack>
                                            <Stack direction="row" alignItems="center" display="grid">
                                                <Select 
                                                    label="Material"
                                                    value={ sm.item } 
                                                    options={ items ?? [ ] } 
                                                    handleChange={ e => {
                                                        const newMaterials = ( Object.assign( [ ], formData.selectedMaterials ) ) as typeof formData.selectedMaterials;

                                                        newMaterials[ i ].item = e as CatalogOption;
                                                        
                                                        setFormField( "selectedMaterials", newMaterials );
                                                    } } 
                                                    noOptionsText="No hay datos"
                                                    disableClearable
                                                    allowUnknown
                                                    //helperText={ getHelperTextIfUnknown( selectedMaterials[ i ].item, "Se agregará al catálogo" ) }
                                                    sx={{ width: "100%" }}
                                                    disabled={ loading }
                                                    highlightUnknown
                                                />
                                            </Stack>
                                            <Stack direction="row" display="grid" gridTemplateColumns="49% 49%" gap="0.5rem" boxSizing="border-box">
                                                <Stack direction="column">
                                                    <Typography variant="body2">Cantidad</Typography>
                                                    <TextInput 
                                                        sx={{ width: "100%" }} 
                                                        disabled={ loading } 
                                                        label="" 
                                                        value={ sm.quantity } 
                                                        handleChange={ ( e: string ) => {
                                                            const newMaterials = ( Object.assign( [ ], formData.selectedMaterials ) ) as typeof formData.selectedMaterials;

                                                            if( isNaN( Number( e ) ) )
                                                                return;

                                                            newMaterials[ i ].quantity = e ? e : "1";

                                                            setFormField( "selectedMaterials", newMaterials );
                                                        } } 
                                                    />
                                                </Stack>
                                                <Select 
                                                    label="Unidad de Medida"
                                                    value={ sm.measureUnit } 
                                                    options={ measureUnits ?? [ ] } 
                                                    handleChange={ e => {
                                                        const newMaterials = ( Object.assign( [ ], formData.selectedMaterials ) ) as typeof formData.selectedMaterials;

                                                        newMaterials[ i ].measureUnit = e as CatalogOption;
                                                        
                                                        setFormField( "selectedMaterials", newMaterials );
                                                    } } 
                                                    noOptionsText="No hay datos"
                                                    disableClearable
                                                    allowUnknown
                                                    highlightUnknown
                                                    disabled={ loading }
                                                    sx={{ width: "100%" }}
                                                />
                                            </Stack>
                                            <Stack direction="row">
                                                <Switch 
                                                    label="Urgente"
                                                    checked={ sm.isUrgent } 
                                                    onChange={ v => {
                                                        const newMaterials = ( Object.assign( [ ], formData.selectedMaterials ) ) as typeof formData.selectedMaterials;

                                                        newMaterials[ i ].isUrgent = v;

                                                        setFormField( "selectedMaterials", newMaterials );
                                                    } } 
                                                />
                                            </Stack>
                                        </Stack>
                                    ) )
                                }
                                <Button
                                    variant="contained" 
                                    sx={{ height: "fit-content" }}
                                    onClick={( ) => {
                                        const newMaterials = Object.assign( [ ], formData.selectedMaterials );
    
                                        newMaterials.push( {
                                            item: items[ 0 ],
                                            quantity: "1",
                                            measureUnit: measureUnits[ 0 ],
                                            isUrgent: false
                                        } );
                                        
                                        setFormField( "selectedMaterials", newMaterials );
                                    }}
                                >
                                    Agregar material
                                </Button>
                            </Fragment>
                        )
                    }
                </Stack>
            </Modal>
        );
    } else {
        return (
            <Modal 
                openModal={ opened } 
                closeModal={ ( ) => handleClose( ) } 
                title={ "Agregar solicitud de material" }
                actions={[
                    { label: "Cerrar", callback: ( ) => handleClose( ), disabled: loading },
                    { label: "Guardar", callback: handleRequestCreate, disabled: !canCreate || loading },
                ]}
                fullScreen
            >
                <Box sx={{ display: "grid", gridTemplateColumns: "300px auto", gap: "1rem", height: "100%" }}>
                    <Box 
                        component="form" 
                        sx={{ 
                            display: "flex", flexFlow: "column", 
                            gap: "1rem", borderRight: "solid 1px #B0B0B0", alignItems: "center" 
                        }}
                    >
                        <TextInput 
                            disabled={ loading } 
                            label="Número de Pedido" 
                            sx={{ width: "250px" }} 
                            value={ formData.requestNumber } 
                            handleChange={ v => setFormField( "requestNumber", v ) } 
                            placeholder="17617" 
                            onBlur={ ( ) => {
                                const { requestNumber, selectedProjectOption: project } = formData;
                                
                                if( !requestNumber || !project?.id )
                                    return;
                                
                                dispatch( checkRequestExists( { 
                                    requestNumber: requestNumber,
                                    projectId: ( project.id as number ),
                                } ) ).unwrap( ).then( r => {
                                    const { body, userMessage } = r;
                                    
                                    setReqExists( body.requestExists );
                                    
                                    if( body.requestExists ) {
                                        setInputErrors( prev => ( { ...prev, requestNumber: userMessage } ) );
                                    } else {
                                        const newErrors = inputErrors;

                                        delete newErrors.requestNumber;
                                        
                                        setInputErrors( newErrors );
                                    }
                                } );
                            } }
                            error={ !!inputErrors.requestNumber }
                            helperText={ inputErrors.requestNumber }
                        />
                        <Select 
                            value={ formData.selectedProjectOption } 
                            label="Proyecto" 
                            options={ loggedUser?.projects?.map( p => ( { id: p.id, label: p.title } ) ) ?? [ ] } 
                            handleChange={ v => setFormField( "selectedProjectOption", v ) } 
                            noOptionsText="No hay datos"
                            disableClearable
                            disabled={ loading }
                            sx={{ width: "250px" }}
                        />
                        <Select 
                            value={ formData.selectedActivity } 
                            label="Actividad" 
                            options={ selectedProject?.activities?.map( a => ( { id: a.id, label: a.title } ) ) ?? [ ] } 
                            handleChange={ v => setFormField( "selectedActivity", v ) } 
                            noOptionsText="No hay datos"
                            disableClearable
                            allowUnknown
                            highlightUnknown
                            noSelectionText=""
                            disabled={ loading || !formData.selectedProjectOption }
                            sx={{ width: "250px" }}
                        />
                    </Box>
                    <Box sx={{ display: "flex", flexFlow: "column", gap: "1rem", boxSizing: "border-box", justifyContent: "flex-start", alignItems: "center" }}>
                        <Paper variant="rounded" sx={{ padding: "1rem", boxSizing: "border-box", display: "flex", flexFlow: "column", gap: "1rem", height: "70vh", maxHeight: "70vh", width: "100%" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Box sx={{ display: "flex", flexFlow: "column" }}>
                                    <Typography variant="header2">Lista de Materiales</Typography>
                                    <Typography variant="header3">Para este pedido</Typography>
                                </Box>
                                <Button
                                    variant="contained" 
                                    sx={{ height: "fit-content" }}
                                    onClick={( ) => {
                                        const newMaterials = Object.assign( [ ], formData.selectedMaterials );
    
                                        newMaterials.push( {
                                            item: items[ 0 ],
                                            quantity: "1",
                                            measureUnit: measureUnits[ 0 ],
                                            isUrgent: false
                                        } );
                                        
                                        setFormField( "selectedMaterials", newMaterials );
                                    }}
                                >Agregar material</Button>
                            </Box>
                            <Box sx={{ display: "grid", gridTemplateColumns: "50px 40% 100px auto 100px 50px", gap: "0.5rem", borderTop: "solid 1px #B0B0B0", borderBottom: "solid 1px #B0B0B0", padding: "0.5rem 0" }}>
                                <Typography>#</Typography>
                                <Typography>Material</Typography>
                                <Typography>Cantidad</Typography>
                                <Typography>Unidad de Medida</Typography>
                                <Typography>Urgente</Typography>
                            </Box>
                            {
                                formData.selectedMaterials.length ?
                                    (
                                        <Box sx={{ display: "grid", gridTemplateColumns: "50px 40% 100px auto 100px 50px", gap: "0.5rem", alignItems: "center", overflowY: "auto" }}>
                                            {
                                                formData.selectedMaterials.map( ( sm, i ) => (
                                                    <Fragment key={ i }>
                                                        <Box sx={{ display: "flex", alignItems: "center" }}><Typography component="div" sx={{  }}>{ i + 1 }</Typography></Box>
                                                        <Select 
                                                            value={ sm.item } 
                                                            options={ items ?? [ ] } 
                                                            handleChange={ e => {
                                                                const newMaterials = ( Object.assign( [ ], formData.selectedMaterials ) ) as typeof formData.selectedMaterials;
    
                                                                newMaterials[ i ].item = e as CatalogOption;
                                                            
                                                                setFormField( "selectedMaterials", newMaterials );
                                                            } } 
                                                            noOptionsText="No hay datos"
                                                            disableClearable
                                                            allowUnknown
                                                            //helperText={ getHelperTextIfUnknown( selectedMaterials[ i ].item, "Se agregará al catálogo" ) }
                                                            sx={{ width: "100%" }}
                                                            disabled={ loading }
                                                            highlightUnknown
                                                        />
                                                        <TextInput 
                                                            sx={{ width: "100px" }} 
                                                            disabled={ loading } 
                                                            label="" 
                                                            value={ sm.quantity } 
                                                            handleChange={ ( e: string ) => {
                                                                const newMaterials = ( Object.assign( [ ], formData.selectedMaterials ) ) as typeof formData.selectedMaterials;
    
                                                                if( isNaN( Number( e ) ) )
                                                                    return;
    
                                                                newMaterials[ i ].quantity = e ? e : "1";
    
                                                                setFormField( "selectedMaterials", newMaterials );
                                                            } } 
                                                        />
                                                        <Select 
                                                            value={ sm.measureUnit } 
                                                            options={ measureUnits ?? [ ] } 
                                                            handleChange={ e => {
                                                                const newMaterials = ( Object.assign( [ ], formData.selectedMaterials ) ) as typeof formData.selectedMaterials;
    
                                                                newMaterials[ i ].measureUnit = e as CatalogOption;
                                                            
                                                                setFormField( "selectedMaterials", newMaterials );
                                                            } } 
                                                            noOptionsText="No hay datos"
                                                            disableClearable
                                                            allowUnknown
                                                            highlightUnknown
                                                            disabled={ loading }
                                                            sx={{ width: "fit-content" }}
                                                        />
                                                        <Switch 
                                                            checked={ sm.isUrgent } 
                                                            onChange={ v => {
                                                                const newMaterials = ( Object.assign( [ ], formData.selectedMaterials ) ) as typeof formData.selectedMaterials;
    
                                                                newMaterials[ i ].isUrgent = v;
    
                                                                setFormField( "selectedMaterials", newMaterials );
                                                            } } 
                                                        />
                                                        <IconButton
                                                            onClick={ ( ) => {
                                                                const newMaterials = ( Object.assign( [ ], formData.selectedMaterials ) ) as typeof formData.selectedMaterials;
    
                                                                newMaterials.splice( i, 1 );
    
                                                                setFormField( "selectedMaterials", newMaterials );
                                                            }}
                                                            sx={{
                                                                "&:focus": {
                                                                    outline: "none"
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Fragment>
                                                ) )
                                            }
                                        </Box>    
                                    ) :
                                    (
                                        <Box sx={{ display: "flex", flexFlow: "column", alignItems: "center", margin: "auto" }}>
                                            <img src={ EmptyImage } width={150} />
                                            <Typography component={"div"}>No agregó materiales</Typography>
                                        </Box>
                                    )
                            }
                        </Paper>
                    </Box>
                </Box>
            </Modal>
        );    
    }
};

export default RequestCreateModal;
