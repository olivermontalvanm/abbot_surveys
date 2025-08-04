import { Cancel, Edit, Save } from "@mui/icons-material";
import { Box, Divider, IconButton, InputBase, Paper, Stack, styled, Typography, useTheme } from "@mui/material";
import { FC, Fragment, useEffect, useState } from "react";

const EditableToggler = styled( Stack )`
    button {
        display: none;
    }

    &:hover button {
        padding: 0;
        display: inherit;
    }
`;

const EditableItem: FC<{ value: string, onSave: ( newValue: string ) => void }> = ( { value, onSave } ) => {
    const theme = useTheme( );

    const [ isEditing, setIsEditing ] = useState( false );
    const [ localValue, setLocalValue ] = useState( value );

    useEffect( ( ) => {
        setLocalValue( value );
    }, [ value ] );
    
    const handleCancel = ( ) => {
        setIsEditing( false );
        setLocalValue( value );
    };

    const handleSave = ( newValue: string ) => {
        setIsEditing( false );
        onSave( newValue );
    };
    
    return (
        <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', border: `solid 1px ${ theme.palette.grayBg2 }` }}
            elevation={0}
        >
            <Stack direction="column" sx={{ width: "100%" }}>
                <EditableToggler direction="row" sx={{ width: "100%" }}>
                    {
                        isEditing ? (
                            <InputBase
                                sx={{ ml: 0, flex: 1, wordWrap: 'break-word', overflowWrap: "break-word" }}
                                multiline
                                minRows={ 1 }
                                value={ localValue }
                                onChange={ ( e ) => setLocalValue( e.target.value ) }
                            />    
                        ) : (
                            <Box sx={{ minHeight: "32px", display: "flex", alignItems: "center", position: "relative", width: "100%" }}>
                                <Typography 
                                    variant="body1"
                                    component={ "div" }
                                    sx={{ ml: 0, flex: 1, wordWrap: 'break-word', overflowWrap: "break-word", whiteSpace: "pre-wrap", width: "100%", display: "block" }}
                                >{ value }</Typography>
                                <IconButton sx={{ p: '10px', outline: "none !important", position: "absolute", right: 0 }} aria-label="directions" onClick={ ( ) => { setIsEditing( true ); } }>
                                    <Edit />
                                </IconButton>    
                            </Box>
                        )
                    }
                </EditableToggler>
                {
                    isEditing && (
                        <Fragment>
                            <Divider sx={{ height: 1, m: 0.5, borderColor: theme.palette.grayBg2 }} orientation="horizontal" />
                            <Stack direction="row" justifyContent="flex-end">
                                <IconButton color="primary" sx={{ p: '10px', outline: "none !important" }} aria-label="directions" onClick={ ( ) => { handleCancel( ); } }>
                                    <Cancel />
                                </IconButton>
                                <IconButton disabled={ value == localValue } color="primary" sx={{ p: '10px', outline: "none !important" }} aria-label="directions" onClick={ ( ) => { handleSave( localValue ); } }>
                                    <Save />
                                </IconButton>
                            </Stack>
                        </Fragment>
                    )
                }
            </Stack>
        </Paper>
    );
};

export default EditableItem;
