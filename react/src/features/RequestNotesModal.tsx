import React, { FC, useEffect, useRef, useState } from "react";
import Modal from "../components/Modal";
import { fetchRequestNotes, postRequestNote, requestNoteDelete, requestNoteUpdate, RootState } from "../store/store";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../hooks/hooks";
import { Box, Paper, Typography, IconButton, useTheme, Stack, Divider, TextField, MenuItem, ClickAwayListener, Tooltip, Fade } from "@mui/material";
import { Close, MoreVert, Save, Send } from "@mui/icons-material";
import { Request, RequestNote } from "../interfaces/Models";
import dayjs from "dayjs";

interface IProps {
    opened: boolean; onCreate?: ( ) => void;
    toggler: ( params: { opened: boolean; request: Request | null; } ) => void; 
    mobile?: boolean; request: Request | null;
};

const RequestNotesModal: FC<IProps> = ( { opened, toggler, onCreate, request, mobile = false } ) => {
    const dispatch = useAppDispatch( );
    const theme = useTheme( );
    const { loggedUser } = useSelector( ( state: RootState ) => state.common );

    const [ noteContent, setNoteContent ] = useState<string>( "" );
    const [ notes, setNotes ] = useState<RequestNote[ ]>( [ ] );
    const [ noteMenuId, setNoteMenuId ] = useState<number | null>( null );
    const [ noteToEditId, setNoteToEditId ] = useState<number | null>( null );
    
    useEffect( ( ) => {
        if( !request )
            setNotes( [ ] );
        
        if( opened ) {
            loadNotes( );
            
            if( noteInputRef ) {
                noteInputRef.current?.focus( );

                const inputFocusTimer = setTimeout( ( ) => {
                    if( mobile )
                        return;
                    
                    noteInputRef.current?.focus();
                }, 100 );
    
                return ( ) => clearTimeout( inputFocusTimer );    
            }
        } else {
            if( noteToEditId ) setNoteContent( "" );
            
            setNoteToEditId( null );
            setNoteMenuId( null );
        }
    }, [ opened, request ] );

    useEffect( ( ) => {
        scrollToLastNote( );
    }, [ notes ] );

    useEffect( ( ) => {
        if( !!noteToEditId && noteInputRef )
            noteInputRef.current?.focus( );
    }, [ noteToEditId ] )

    useEffect( ( ) => {
        if( noteToEditId ) {
            const noteToEdit = notes.find( n => n.id == noteToEditId );

            if( noteToEdit )
                setNoteContent( noteToEdit.content );
        }
    }, [ noteToEditId ] );

    const loadNotes = ( ) => {
        if( request !== null ) {
            dispatch( fetchRequestNotes( request.id ) ).unwrap( )
            .then( r => {
                setNotes( r );
            } );
        }
    };
    
    const handleCreateNote = ( noteContent: string ) => {
        if( request === null )
            return;
        
        const curatedContent = noteContent.replace( /\n{3,}/g, "\n\n" );
		
        dispatch( postRequestNote( { requestId: request.id, noteContent: curatedContent } ) )
        .then( ( ) => {
            setNoteContent( "" );

            dispatch( fetchRequestNotes( request.id ) )
            .unwrap( )
            .then( ( ) => {
                loadNotes( );

                if( onCreate && typeof onCreate === "function" )
                    onCreate( );
            } );
        } );
    };

    const scrollToLastNote = ( ) => {
        if( notesContainerEl && notesContainerEl.scrollHeight )
            notesContainerEl.scrollTo( 0, notesContainerEl.scrollHeight );
    };

    const handleClose = ( ) => {
        toggler( { opened: false, request: null } );
    };

    const handleNoteUpdate = async ( noteId: number, newContent: string ) => {
        dispatch( requestNoteUpdate( { noteId, newContent } ) ).unwrap( )
        .then( n => {
            const newNotes = notes;
            const swapIx = newNotes.findIndex( en => en.id == n.id );

            newNotes[ swapIx ] = n;

            setNotes( newNotes );
        } )
        .finally( ( ) => {
            setNoteContent( "" );
            setNoteToEditId( null );
            setNoteMenuId( null );
        } );
    };

    const handleNoteDelete = async ( noteId: number ) => {
        dispatch( requestNoteDelete( { noteId } ) ).unwrap( )
        .then( ( ) => {
            const newNotes = notes.filter( n => n.id !== noteId );

            setNotes( newNotes );
        } )
        .finally( ( ) => {
            setNoteContent( "" );
            setNoteToEditId( null );
            setNoteMenuId( null );
        } );
    };

    const handleSubmit = ( ) => {
        if( !noteContent )
            return;
        
        if( noteToEditId ) {
            handleNoteUpdate( noteToEditId, noteContent );
        } else {
            handleCreateNote( noteContent );
        }
    };

    const NoteNode: React.FC<{ note: RequestNote }> = ( { note } ) => {
        const isSelf = loggedUser?.id == note.author?.id;
        const isEditing = noteToEditId == note.id;
        
        return (
            <Stack sx={ { justifyContent: `flex-${ isSelf ? "end" : "start" }`, width: "100%", backgroundColor: isEditing ? theme.palette.blue : "inherit" } } direction="row">
                <Paper
                    elevation={4}
                    sx={{
                        backgroundColor: isSelf ? theme.palette.blue : theme.palette.yellow,
                        padding: "0.5rem", borderRadius: "8px",
                        width: mobile ? "100%" : "fit-content", maxWidth: mobile ? "100%" : "50%", minWidth: "25%",
                        position: "relative"
                    }}
                >
                    {
                        noteMenuId == note.id && (
                            <ClickAwayListener onClickAway={ ( ) => { setNoteMenuId( null ) } }>
                                <Box
                                    id="note-menu"
                                    sx={{ position: "absolute", right: 0, top: 0, zIndex: 3 }}
                                >
                                    <Paper elevation={4}>
                                        <MenuItem
                                            onClick={ ( ) => {
                                                setNoteToEditId( note.id );
                                                setNoteMenuId( null );
                                            } }
                                        >Editar</MenuItem>
                                        <MenuItem
                                            onClick={ ( ) => {
                                                handleNoteDelete( note.id );
                                                setNoteMenuId( null );
                                            } }
                                        >Eliminar</MenuItem>
                                    </Paper>
                                </Box>
                            </ClickAwayListener>
                        )
                    }
                    <Stack direction="row" marginBottom="0.5rem" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={500}>{ note.author?.firstname } { note.author?.lastname }</Typography>
                        {
                            isSelf && (
                                <IconButton 
                                    sx={{ cursor: "pointer" }} 
                                    onClick={ ( ) => {
                                        setNoteMenuId( note.id );
                                    }}
                                >
                                    <MoreVert />
                                </IconButton>
                            )
                        }
                    </Stack>
                    <Divider orientation="horizontal" />
                    <Box sx={{ padding: "1rem 0", whiteSpace: "pre-line" }}>
                        <Typography>{ note.content }</Typography>
                    </Box>
                    <Divider orientation="horizontal" />
                    <Stack direction="row" justifyContent="space-between" marginTop="0.5rem">
                        <Stack direction="column">
                            {
                                note.modified && (
                                    <Typography variant="body3">(Editado)</Typography>
                                )
                            }
                        </Stack>
                        <Stack direction="column">
                            <Typography variant="body2" sx={{ textAlign: "right" }}>{ dayjs( note.createdAt ).format( "DD/MM/YYYY" ) }</Typography>
                            <Typography variant="body2" sx={{ textAlign: "right" }}>{ dayjs( note.createdAt ).format( "hh:mm a" ) }</Typography>
                        </Stack>
                    </Stack>
                </Paper>
            </Stack>
        )
    };

    const notesContainerEl = document.getElementById( "notes-container" );
    const noteInputRef = useRef<HTMLInputElement>( null );

    if( request === null )
        return null;

    return (
        <Modal 
            openModal={ opened } 
            closeModal={ ( ) => handleClose( ) } 
            title={ `Notas de pedido #${ request?.reqNumber }` }
            actions={[ ]}
            fullScreen
            closeButton
        >
            <Box sx={{ display: "grid", gridTemplateColumns: `${ mobile ? "100%" : "300px" } auto`, gap: "1rem", height: "100%" }}>
                <Box 
                    component="form" 
                    sx={{ 
                        display: mobile ? "none" : "flex", flexFlow: "column", 
                        gap: "1rem", borderRight: "solid 1px #B0B0B0", alignItems: "flex-start",
                        overflow: "auto"
                    }}
                >
                    <Typography variant="header2" fontWeight={500}>Información del pedido</Typography>
                    <Divider orientation="horizontal" sx={{ display: "block", width: "100%" }} />
                    <Stack direction="column">
                        <Typography variant="body2">Descripción:</Typography>
                        <Typography>{ request?.item?.title }</Typography>
                    </Stack>
                    <Stack direction="column">
                        <Typography variant="body2">Cantidad/UM:</Typography>
                        <Typography>{ request?.quantity } { request?.measureUnit?.title }</Typography>
                    </Stack>
                    <Stack direction="column">
                        <Typography variant="body2">Proyecto:</Typography>
                        <Typography>{ request?.project?.title }</Typography>
                    </Stack>
                    <Stack direction="column">
                        <Typography variant="body2">Actividad:</Typography>
                        <Typography>{ request?.activity?.title }</Typography>
                    </Stack>
                    {
                        request?.shoppingReqNumber && (
                            <Stack direction="column">
                                <Typography variant="body2">Nº Solicitud/OC:</Typography>
                                <Typography>{ request?.shoppingReqNumber }</Typography>
                            </Stack>
                        )
                    }
                </Box>
                <Box 
                    sx={{
                        display: "flex", flexFlow: "column", gap: "0", boxSizing: "border-box", 
                        justifyContent: "flex-start", alignItems: "center",
                        overflow: "auto", padding: "0.5rem 0",
                        border: `solid 1px ${ theme.palette.grayBg }`,
                        borderRadius: "8px", position: "relative"
                    }}
                >
                    <Paper
                        elevation={0} 
                        sx={{ 
                            padding: "0.5rem", boxSizing: "border-box", display: "flex", flexFlow: "column", 
                            gap: "1rem", width: "100%", paddingBottom: "5rem", position: "relative",
                            maxHeight: "100%", overflow: "auto"
                        }}
                        id="notes-container"
                    >
                        <Stack direction="column" gap="1rem">
                            {
                                notes.map( n => (
                                    <NoteNode key={ n.id } note={ n } />
                                ) )
                            }
                        </Stack>
                    </Paper>
                    <Paper elevation={0} sx={{ backgroundColor: "transparent", position: "absolute", bottom: 0, width: "80%", padding: "0.5rem" }}>
                        <Stack direction="row" gap="0.25rem" alignItems="flex-end">
                            <Fade in={ !!noteToEditId }>
                                <Paper 
                                    sx={{ 
                                        display: "flex", flexFlow: "column", justifyContent: "center", 
                                        backgroundColor: theme.palette.customRed.light, 
                                        borderRadius: "16px", width: "50px", height: "50px", marginBottom: "5px" 
                                    }}
                                >
                                    <IconButton 
                                        onClick={( ) => { 
                                            setNoteToEditId( null );
                                            setNoteContent( "" );
                                        } }
                                    >
                                        <Tooltip arrow title="Cancelar edición" placement="top">
                                            <Close />
                                        </Tooltip>
                                    </IconButton>
                                </Paper>
                            </Fade>
                            <TextField
                                sx={{ 
                                    width: "100%", backgroundColor: theme.palette.pureWhite, marginBottom: "0rem", 
                                    borderRadius: "16px", 
                                    "& .MuiInputBase-root": { borderRadius: "16px" }
                                }}
                                multiline
                                maxRows={ 10 }
                                minRows={ 1 }
                                placeholder="Escriba acá..."
                                value={ noteContent }
                                onChange={ e => setNoteContent( e.target.value ) }
                                onKeyUp={ e => {
                                    if( e.ctrlKey && e.key == "Enter" ) {
                                        handleSubmit( );
                                    }
                                } }
                                inputRef={ noteInputRef }
                            />
                            <Paper 
                                sx={{ 
                                    display: "flex", flexFlow: "column", justifyContent: "center", 
                                    backgroundColor: noteContent ? theme.palette.customBlue.light : theme.palette.grayBg, 
                                    borderRadius: "16px", width: "50px", height: "50px", marginBottom: "5px" 
                                }}
                            >
                                <IconButton 
                                    onClick={( ) => { 
                                        handleSubmit( );
                                    } }
                                    disabled={ !noteContent }
                                >
                                    {
                                        noteToEditId ?
                                            ( 
                                                <Tooltip arrow title="Actualizar nota" placement="top">
                                                    <Save /> 
                                                </Tooltip>
                                            ) : (
                                                <Tooltip arrow title="Enviar nota" placement="top">
                                                    <Send />
                                                </Tooltip>
                                            )
                                    }
                                </IconButton>
                            </Paper>
                        </Stack>
                    </Paper>
                </Box>
            </Box>
        </Modal>
    );    
};

export default RequestNotesModal;
