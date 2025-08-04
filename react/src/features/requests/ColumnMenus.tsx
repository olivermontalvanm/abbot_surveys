import { ArrowDropDownCircle, ArrowDropDownCircleOutlined } from "@mui/icons-material";
import { Badge, Box, Button, ClickAwayListener, IconButton, Paper, Stack, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import TextInput from "../../components/inputs/TextInput";
import { CatalogOption, RequestCategory } from "../../interfaces/Common";
import Select from "../../components/inputs/Select";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { requestStatuses } from "../../constants";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { esES } from "@mui/x-date-pickers/locales";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

/**
 * Renders a menu for filtering requests by number.
 * Handles the state of the menu.
 * 
 * @returns JSX.Element
 */
export const ReqNumberMenu: FC<{ reqNumber: string; handleChange: ( reqNumber: string ) => void; }> = ( { reqNumber, handleChange } ) => {
    const [ opened, setOpened ] = useState<boolean>( false );
    const [ value, setValue ] = useState<string>( reqNumber );

    useEffect( ( ) => {
        setValue( reqNumber );
    }, [ reqNumber ] );

    const handleApply = ( val: typeof value ) => {
        handleChange( val );
        setOpened( false );
    };

    const handleCancel = ( ) => {
        setValue( reqNumber );
        setOpened( false );
    };

    const handleReset = ( ) => {
        setValue( "" );
        handleChange( "" );
    }
    
    return (
        <ClickAwayListener
            onClickAway={ ( ) => { handleCancel( ); } }
        >
            <Box>
                <IconButton onClick={ ( ) => { setOpened( prev => !prev ); } } sx={{ outline: "none !important" }} >
                    <Badge color={ reqNumber ? "primary" : "default" } variant="dot">
                        {
                            opened ? <ArrowDropDownCircle fontSize="small" /> : <ArrowDropDownCircleOutlined fontSize="small" />
                        }
                    </Badge>
                </IconButton> 
                {
                    opened ? (
                        <Paper sx={{ padding: "1rem", position: "absolute", zIndex: 4 }} elevation={ 4 }>
                            <Stack direction="column" gap="1rem">
                                <TextInput
                                    label="Buscar"
                                    value={ value }
                                    placeholder="Ej: 17396"
                                    handleChange={ ( v ) => { setValue( v ); } }
                                    onKeyUp={k => { 
                                        if( k.key == "Enter" )
                                            handleApply( value );
                                    }}                        
                                />
                                <Stack direction="column" gap="0.5rem">
                                    <Button
                                        variant="contained"
                                        onClick={ ( ) => { handleApply( value ); } }
                                    >
                                        Aplicar
                                    </Button>
                                    <Button 
                                        variant="text" 
                                        onClick={ ( ) => { handleReset( ); } }
                                        sx={{ backgroundColor: "transparent !important" }}
                                    >
                                        Resetear
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ) : null
                }
            </Box>
        </ClickAwayListener>
    );
};

export const ShoppingReqNumberMenu: FC<{ 
    shopReqNumber: string; 
    handleChange: ( shopReqNumber: string ) => void; 
}> = ( { shopReqNumber, handleChange } ) => {
    const [ opened, setOpened ] = useState<boolean>( false );
    const [ value, setValue ] = useState<string>( shopReqNumber );

    useEffect( ( ) => {
        setValue( shopReqNumber );
    }, [ shopReqNumber ] );

    const handleApply = ( val: typeof value ) => {
        handleChange( val );
        setOpened( false );
    };

    const handleCancel = ( ) => {
        setValue( shopReqNumber );
        setOpened( false );
    };

    const handleReset = ( ) => {
        setValue( "" );
        handleChange( "" );
    }
    
    return (
        <ClickAwayListener
            onClickAway={ ( ) => { handleCancel( ); } }
        >
            <Box>
                <IconButton onClick={ ( ) => { setOpened( prev => !prev ); } } sx={{ outline: "none !important" }} >
                    <Badge color={ shopReqNumber ? "primary" : "default" } variant="dot">
                        {
                            opened ? <ArrowDropDownCircle fontSize="small" /> : <ArrowDropDownCircleOutlined fontSize="small" />
                        }
                    </Badge>
                </IconButton> 
                {
                    opened ? (
                        <Paper sx={{ padding: "1rem", position: "absolute", zIndex: 4 }} elevation={ 4 }>
                            <Stack direction="column" gap="1rem">
                                <TextInput
                                    label="Buscar"
                                    value={ value }
                                    placeholder="Ej: OC-1234"
                                    handleChange={ ( v ) => { setValue( v ); } }
                                    onKeyUp={k => { 
                                        if( k.key == "Enter" )
                                            handleApply( value );
                                    }}                        
                                />
                                <Stack direction="column" gap="0.5rem">
                                    <Button
                                        variant="contained"
                                        onClick={ ( ) => { handleApply( value ); } }
                                    >
                                        Aplicar
                                    </Button>
                                    <Button 
                                        variant="text" 
                                        onClick={ ( ) => { handleReset( ); } }
                                        sx={{ backgroundColor: "transparent !important" }}
                                    >
                                        Resetear
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ) : null
                }
            </Box>
        </ClickAwayListener>
    );
};

export const ProjectActivityMenu: FC<{ 
    project: CatalogOption | null; 
    activity: CatalogOption | null; 
    handleChange: ( value: { project: CatalogOption | null, activity: CatalogOption | null } ) => void; 
}> = ( { project, activity, handleChange } ) => {
    const { projects } = useSelector( ( state: RootState ) => state.common );
        
    const [ opened, setOpened ] = useState<boolean>( false );
    const [ value, setValue ] = useState<{
        project: CatalogOption | null;
        activity: CatalogOption | null;
    }>( { project, activity } );

    useEffect( ( ) => {
        setValue( { project, activity } );
    }, [ project, activity ] );

    const handleApply = ( value: { project: CatalogOption | null, activity: CatalogOption | null } ) => {
        handleChange( value );
        setOpened( false );
    };

    const handleCancel = ( ) => {
        setValue( { project, activity } );
        setOpened( false );
    };

    const handleReset = ( ) => {
        setValue( { project, activity } );
        handleChange( { project: null, activity: null } );
    }

    return (
        <ClickAwayListener
            onClickAway={ ( ) => { handleCancel( ); } }
        >
            <Box>
                <IconButton onClick={ ( ) => { setOpened( prev => !prev ); } } sx={{ outline: "none !important" }} >
                    <Badge color={ ( project?.id || activity?.id ) ? "primary" : "default" } variant="dot">
                        {
                            opened ? <ArrowDropDownCircle fontSize="small" /> : <ArrowDropDownCircleOutlined fontSize="small" />
                        }
                    </Badge>
                </IconButton> 
                {
                    opened ? (
                        <Paper sx={{ padding: "1rem", position: "absolute", minWidth: "300px", zIndex: 4, }} elevation={ 4 }>
                            <Stack direction="column" gap="1rem">
                                <Select
                                    label="Proyecto"
                                    value={ value.project }
                                    options={ projects }
                                    handleChange={ v => { setValue( { project: v as CatalogOption, activity: null } ); } }
                                />
                                <Select
                                    label="Actividad"
                                    value={ value.activity }
                                    options={ projects.find( p => p.id == value.project?.id )?.activities || [ ] }
                                    handleChange={ v => { setValue( p => ( { activity: v as CatalogOption, project: p.project } ) ); } }
                                    disabled={ !value.project?.id || !value.project }
                                />
                                
                                <Stack direction="column" gap="0.5rem">
                                    <Button
                                        variant="contained"
                                        onClick={ ( ) => { handleApply( value ); } }
                                    >
                                        Aplicar
                                    </Button>
                                    <Button 
                                        variant="text" 
                                        onClick={ ( ) => { handleReset( ); } }
                                        sx={{ backgroundColor: "transparent !important" }}
                                    >
                                        Resetear
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ) : null
                }
            </Box>
        </ClickAwayListener>
    );
};

export const DescriptionMenu: FC<{ 
    item: string; 
    handleChange: ( value: string ) => void; 
}> = ( { item, handleChange } ) => {
    const [ opened, setOpened ] = useState<boolean>( false );
    const [ value, setValue ] = useState<string>( item );

    useEffect( ( ) => {
        setValue( item );
    }, [ item ] );

    const handleApply = ( value: string ) => {
        handleChange( value );
        setOpened( false );
    };

    const handleCancel = ( ) => {
        setValue( item );
        setOpened( false );
    };

    const handleReset = ( ) => {
        setValue( item );
        handleChange( "" );
    }

    return (
        <ClickAwayListener
            onClickAway={ ( ) => { handleCancel( ); } }
        >
            <Box>
                <IconButton onClick={ ( ) => { setOpened( prev => !prev ); } } sx={{ outline: "none !important" }} >
                    <Badge color={ ( item?.length ) ? "primary" : "default" } variant="dot">
                        {
                            opened ? <ArrowDropDownCircle fontSize="small" /> : <ArrowDropDownCircleOutlined fontSize="small" />
                        }
                    </Badge>
                </IconButton> 
                {
                    opened ? (
                        <Paper sx={{ padding: "1rem", position: "absolute", zIndex: 4 }} elevation={ 4 }>
                            <Stack direction="column" gap="1rem">
                                <TextInput
                                    label="Buscar"
                                    value={ value }
                                    placeholder="Ej: Cemento"
                                    handleChange={ ( v ) => { setValue( v ); } }
                                    onKeyUp={k => { 
                                        if( k.key == "Enter" )
                                            handleApply( value );
                                    }}                        
                                />
                                
                                <Stack direction="column" gap="0.5rem">
                                    <Button
                                        variant="contained"
                                        onClick={ ( ) => { handleApply( value ); } }
                                    >
                                        Aplicar
                                    </Button>
                                    <Button 
                                        variant="text" 
                                        onClick={ ( ) => { handleReset( ); } }
                                        sx={{ backgroundColor: "transparent !important" }}
                                    >
                                        Resetear
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ) : null
                }
            </Box>
        </ClickAwayListener>
    );
};

export const ShoppingAssigneeMenu: FC<{ 
    assignee: CatalogOption | null; 
    handleChange: ( value: { assignee: CatalogOption | null } ) => void; 
}> = ( { assignee, handleChange } ) => {
    const { shoppingAnalysts } = useSelector( ( state: RootState ) => state.common );
        
    const [ opened, setOpened ] = useState<boolean>( false );
    const [ value, setValue ] = useState<{
        assignee: CatalogOption | null;
    }>( { assignee } );

    useEffect( ( ) => {
        setValue( { assignee: assignee } );
    }, [ assignee ] );

    const handleApply = ( value: { assignee: CatalogOption | null } ) => {
        handleChange( value );
        setOpened( false );
    };

    const handleCancel = ( ) => {
        setValue( { assignee: assignee } );
        setOpened( false );
    };

    const handleReset = ( ) => {
        setValue( { assignee: assignee } );
        handleChange( { assignee: null } );
    }

    const unassignedLabel = "Sin asignar";

    return (
        <ClickAwayListener
            onClickAway={ ( ) => { handleCancel( ); } }
        >
            <Box>
                <IconButton onClick={ ( ) => { setOpened( prev => !prev ); } } sx={{ outline: "none !important" }} >
                    <Badge color={ ( assignee ) ? "primary" : "default" } variant="dot">
                        {
                            opened ? <ArrowDropDownCircle fontSize="small" /> : <ArrowDropDownCircleOutlined fontSize="small" />
                        }
                    </Badge>
                </IconButton> 
                {
                    opened ? (
                        <Paper sx={{ padding: "1rem", position: "absolute", minWidth: "300px", zIndex: 4, right: "0px" }} elevation={ 4 }>
                            <Stack direction="column" gap="1rem">
                                <Select
                                    label="Responsable"
                                    value={ value.assignee }
                                    options={ [ { id: -1, label: unassignedLabel }, ...shoppingAnalysts ] }
                                    handleChange={ v => { setValue( { assignee: v as CatalogOption } ); } }
                                />
                                
                                <Stack direction="column" gap="0.5rem">
                                    <Button
                                        variant="contained"
                                        onClick={ ( ) => { handleApply( value ); } }
                                    >
                                        Aplicar
                                    </Button>
                                    <Button 
                                        variant="text" 
                                        onClick={ ( ) => { handleReset( ); } }
                                        sx={{ backgroundColor: "transparent !important" }}
                                    >
                                        Resetear
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ) : null
                }
            </Box>
        </ClickAwayListener>
    );
};

export const UrgentMenu: FC<{ 
    isUrgent: CatalogOption | null; 
    isOld: CatalogOption | null;
    handleChange: ( value: { isUrgent: CatalogOption | null, isOld: CatalogOption | null } ) => void; 
}> = ( { isUrgent, isOld, handleChange } ) => {
    const [ opened, setOpened ] = useState<boolean>( false );
    const [ value, setValue ] = useState<{
        isUrgent: CatalogOption | null;
        isOld: CatalogOption | null;
    }>( { isUrgent, isOld } );

    useEffect( ( ) => {
        setValue( { isUrgent: isUrgent, isOld: isOld } );
    }, [ isUrgent, isOld ] );

    const handleApply = ( value: { isUrgent: CatalogOption | null, isOld: CatalogOption | null } ) => {
        handleChange( value );
        setOpened( false );
    };

    const handleCancel = ( ) => {
        setValue( { isUrgent: isUrgent, isOld: isOld } );
        setOpened( false );
    };

    const handleReset = ( ) => {
        setValue( { isUrgent: isUrgent, isOld: isOld } );
        handleChange( { isUrgent: null, isOld: null } );
    }

    return (
        <ClickAwayListener
            onClickAway={ ( ) => { handleCancel( ); } }
        >
            <Box>
                <IconButton onClick={ ( ) => { setOpened( prev => !prev ); } } sx={{ outline: "none !important" }} >
                    <Badge color={ ( isUrgent || isOld ) ? "primary" : "default" } variant="dot">
                        {
                            opened ? <ArrowDropDownCircle fontSize="small" /> : <ArrowDropDownCircleOutlined fontSize="small" />
                        }
                    </Badge>
                </IconButton> 
                {
                    opened ? (
                        <Paper sx={{ padding: "1rem", position: "absolute", minWidth: "300px", zIndex: 4, left: "0px" }} elevation={ 4 }>
                            <Stack direction="column" gap="1rem">
                                <Select
                                    label="Prioridad"
                                    value={ value.isUrgent }
                                    options={ [ { id: 0, label: "Normal" }, { id: 1, label: "Urgente" } ] }
                                    handleChange={ v => { setValue( p => ( { ...p, isUrgent: v as CatalogOption } ) ); } }
                                />
                                <Select
                                    label="Caducidad"
                                    value={ value.isOld }
                                    options={ [ { id: 0, label: "A tiempo" }, { id: 1, label: "Retrasado" } ] }
                                    handleChange={ v => { setValue( p => ( { ...p, isOld: v as CatalogOption } ) ); } }
                                />
                                
                                <Stack direction="column" gap="0.5rem">
                                    <Button
                                        variant="contained"
                                        onClick={ ( ) => { handleApply( value ); } }
                                    >
                                        Aplicar
                                    </Button>
                                    <Button 
                                        variant="text" 
                                        onClick={ ( ) => { handleReset( ); } }
                                        sx={{ backgroundColor: "transparent !important" }}
                                    >
                                        Resetear
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ) : null
                }
            </Box>
        </ClickAwayListener>
    );
};

export const RequestDateMenu: FC<{ 
    timeSpan: { from: Dayjs | null, to: Dayjs | null },
    handleChange: ( value: { from: Dayjs | null, to: Dayjs | null } ) => void; 
}> = ( { timeSpan: { from, to }, handleChange } ) => {
    const [ opened, setOpened ] = useState<boolean>( false );
    const [ value, setValue ] = useState<{
        from: Dayjs | null;
        to: Dayjs | null;
    }>( { from, to } );

    useEffect( ( ) => {
        setValue( { from, to } );
    }, [ from, to ] );

    const handleApply = ( value: { from: Dayjs | null, to: Dayjs | null } ) => {
        handleChange( value );
        setOpened( false );
    };

    const handleCancel = ( ) => {
        setValue( { from, to } );
        setOpened( false );
    };

    const handleReset = ( ) => {
        setValue( { from, to } );
        handleChange( { from: null, to: null } );
    }

    return (
        <ClickAwayListener
            onClickAway={ ( ) => { handleCancel( ); } }
        >
            <Box>
                <IconButton onClick={ ( ) => { setOpened( prev => !prev ); } } sx={{ outline: "none !important" }} >
                    <Badge color={ ( from || to ) ? "primary" : "default" } variant="dot">
                        {
                            opened ? <ArrowDropDownCircle fontSize="small" /> : <ArrowDropDownCircleOutlined fontSize="small" />
                        }
                    </Badge>
                </IconButton> 
                {
                    opened ? (
                        <Paper sx={{ padding: "1rem", position: "absolute", minWidth: "300px", zIndex: 4, left: "0px" }} elevation={ 4 }>
                            <Stack direction="column" gap="1rem">
                                <Typography variant="body1">Fecha desde</Typography>
                                <LocalizationProvider dateAdapter={ AdapterDayjs } localeText={ esES.components.MuiLocalizationProvider.defaultProps.localeText }>
                                    <DatePicker 
                                        value={ dayjs( value.from ) } 
                                        onChange={v => setValue( p => ( { ...p, from: v ?? null } ) ) } 
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: 'inherit !important',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'inherit !important',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'inherit !important',
                                                },
                                            }
                                        }} 
                                        slotProps={{
                                            day: { sx: { backgroundColor: "transparent !important", color: "black !important" } }
                                        }} 
                                        closeOnSelect 
                                        format="DD/MM/YYYY"
                                        maxDate={ value.to ? dayjs( value.to ) : dayjs( ) }
                                    />
                                </LocalizationProvider>
                                <Typography variant="body1">Fecha hasta</Typography>
                                <LocalizationProvider dateAdapter={ AdapterDayjs } localeText={ esES.components.MuiLocalizationProvider.defaultProps.localeText }>
                                    <DatePicker 
                                        value={ dayjs( value.to ) } 
                                        onChange={v => setValue( p => ( { ...p, to: v ?? null } ) ) } 
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: 'inherit !important',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'inherit !important',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'inherit !important',
                                                },
                                            }
                                        }} 
                                        slotProps={{
                                            day: { sx: { backgroundColor: "transparent !important", color: "black !important" } }
                                        }} 
                                        closeOnSelect 
                                        format="DD/MM/YYYY"
                                        minDate={ dayjs( value.from ) }
                                        maxDate={ dayjs( ) }
                                    />
                                </LocalizationProvider>
                                
                                <Stack direction="column" gap="0.5rem">
                                    <Button
                                        variant="contained"
                                        onClick={ ( ) => { handleApply( value ); } }
                                    >
                                        Aplicar
                                    </Button>
                                    <Button 
                                        variant="text" 
                                        onClick={ ( ) => { handleReset( ); } }
                                        sx={{ backgroundColor: "transparent !important" }}
                                    >
                                        Resetear
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ) : null
                }
            </Box>
        </ClickAwayListener>
    );
};

export const StatusMenu: FC<{ 
    status: ( CatalogOption&{ group: string; } )[ ] | null;
    statusOptions: CatalogOption[ ];
    handleChange: ( value: { status: ( CatalogOption&{ group: string; } )[ ] | null } ) => void; 
    category: RequestCategory;
}> = ( { status, handleChange, statusOptions, category } ) => {
    const [ opened, setOpened ] = useState<boolean>( false );
    const [ value, setValue ] = useState<{
        status: ( CatalogOption&{ group: string; } )[ ] | null;
            }>( { status } );

    let applicableStatusOptions;

    const getRequestStatusById = ( id: string | number | null ) => {
        const allRequestStatuses = [ ];
        allRequestStatuses.push( ...Object.values( requestStatuses.costStatuses ) );
        allRequestStatuses.push( ...Object.values( requestStatuses.shoppingStatuses ) );
        allRequestStatuses.push( ...Object.values( requestStatuses.admonStatuses ) );

        return allRequestStatuses.find( s => s.id == id )?.label ?? "Pendiente de revisión";
    }

    switch( category ) {
        case "review":
        case "pending":
            applicableStatusOptions = statusOptions.filter( s => s.id != requestStatuses.shoppingStatuses.finished.id );
            applicableStatusOptions = applicableStatusOptions.map( ap => ( { ...ap, label: getRequestStatusById( ap.id ) } ) );
            break;
        case "completed":
            applicableStatusOptions = statusOptions;
            break;
            
        default:
            applicableStatusOptions = statusOptions;
    }

    useEffect( ( ) => {
        setValue( { status } );
    }, [ status ] );

    const handleApply = ( value: { status: ( CatalogOption&{ group: string; } )[ ] | null } ) => {
        handleChange( value );
        setOpened( false );
    };

    const handleCancel = ( ) => {
        setValue( { status } );
        setOpened( false );
    };

    const handleReset = ( ) => {
        setValue( { status } );
        handleChange( { status: null } );
    }

    return (
        <ClickAwayListener
            onClickAway={ ( ) => { handleCancel( ); } }
        >
            <Box>
                <IconButton onClick={ ( ) => { setOpened( prev => !prev ); } } sx={{ outline: "none !important" }} >
                    <Badge color={ ( status ) ? "primary" : "default" } variant="dot">
                        {
                            opened ? <ArrowDropDownCircle fontSize="small" /> : <ArrowDropDownCircleOutlined fontSize="small" />
                        }
                    </Badge>
                </IconButton> 
                {
                    opened ? (
                        <Paper sx={{ padding: "1rem", position: "absolute", minWidth: "300px", zIndex: 4, left: "0px" }} elevation={ 4 }>
                            <Stack direction="column" gap="1rem">
                                <Select
                                    label="Estatus"
                                    value={ value.status }
                                    options={ applicableStatusOptions }
                                    handleChange={ v => { setValue( p => ( { ...p, status: v as ( CatalogOption&{ group: string; } )[ ] | null } ) ); } }
                                    multiple
                                />

                                <Stack direction="column" gap="0.5rem">
                                    <Button
                                        variant="contained"
                                        onClick={ ( ) => { handleApply( value ); } }
                                    >
                                        Aplicar
                                    </Button>
                                    <Button 
                                        variant="text" 
                                        onClick={ ( ) => { handleReset( ); } }
                                        sx={{ backgroundColor: "transparent !important" }}
                                    >
                                        Resetear
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ) : null
                }
            </Box>
        </ClickAwayListener>
    );
};
