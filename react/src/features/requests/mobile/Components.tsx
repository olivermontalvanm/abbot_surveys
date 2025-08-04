import { Add, ChevronLeft, ChevronRight, FirstPage, LastPage, Search, Timer, Warning } from "@mui/icons-material";
import { Badge, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, InputBase, Paper, Skeleton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { FC, useRef, useState } from "react";
import { Request } from "../../../interfaces/Models";
import { Logout } from "@mui/icons-material";
import { useAppDispatch } from "../../../hooks/hooks";
import { logout, RootState } from "../../../store/store";
import { useSelector } from "react-redux";
import { userRoles } from "../../../constants";
import { RequestUtils } from "../../../utils/Utils";

export const CardSkeleton: FC = ( ) => {
    return <Skeleton variant="rectangular" height={ 200 } />
};

export const SearchModal: FC<{ 
    opened: boolean; toggler: ( ) => void; 
    handleConfirm: ( data: { reqNumber: string; description: string; } ) => void; 
}> = ( { opened, toggler, handleConfirm } ) => {
    const theme = useTheme( );
    const [ reqNumber, setReqNumber ] = useState<string>( "" );
    const [ description, setDescription ] = useState<string>( "" );

    const reqNumberRef = useRef<HTMLInputElement>( null );
    const descriptionRef = useRef<HTMLInputElement>( null );

    const submit = ( ) => {
        const trimmedReqNumber = reqNumber.trim( );
        const trimmedDesc = description.trim( );

        handleConfirm( { reqNumber: trimmedReqNumber, description: trimmedDesc } );

        toggler( );
    };
    
    return (
        <Dialog
            open={ opened }
            onClose={ ( ) => { toggler( ); } }
        >
            <DialogTitle>Búsqueda de pedido</DialogTitle>
            <DialogContent>
                <Stack direction="column" spacing={1}>
                    <Typography variant="body1">Nº de Pedido</Typography>
                    <InputBase
                        sx={{ ml: 0, flex: 1, wordWrap: 'break-word', overflowWrap: "break-word", border: `solid 1px ${ theme.palette.grayBg }` }}
                        value={ reqNumber }
                        onChange={ e => { 
                            setReqNumber( e.target.value );
                        } }
                        inputRef={ reqNumberRef }
                        placeholder="3513"
                        type="number"
                    />    
                    <Typography variant="body1">Descripción</Typography>
                    <InputBase
                        sx={{ ml: 0, flex: 1, wordWrap: 'break-word', overflowWrap: "break-word", border: `solid 1px ${ theme.palette.grayBg }` }}
                        value={ description }
                        onChange={ e => { 
                            setDescription( e.target.value );
                        } }
                        inputRef={ descriptionRef }
                        placeholder="Cemento"
                    />    
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button 
                    sx={{ backgroundColor: "transparent !important", color: "black" }}
                    onClick={ ( ) => { toggler( ); } }
                >Cancelar</Button>
                <Button 
                    variant="contained"
                    onClick={ ( ) => {
                        submit( );
                    } }
                >Buscar</Button>
            </DialogActions>
        </Dialog>
    );
};

export const BottomNav: FC<{
    filterCallback: ( ) => void;
    addCallback: ( ) => void;
    filtersActive: boolean;
}> = ( { filterCallback, addCallback, filtersActive } ) => {
    const componentHeight = "60px";
    const theme = useTheme( );
    const dispatch = useAppDispatch( );
    
    const { loggedUser } = useSelector( ( state: RootState ) => state.common );
    
    return (
        <Box
            sx={{ 
                height: componentHeight, backgroundColor: theme.palette.pureWhite, minHeight: componentHeight,
                position: "fixed", bottom: 0, width: "100%"
            }}
        >
            <Stack 
                direction="row" alignItems="center" height={ componentHeight } justifyContent="space-around"
                sx={{
                    border: `solid 1px ${ theme.palette.grayBg2 }`
                }}
            >
                <Box onClick={ filterCallback }>
                    <Stack direction="column" alignItems="center">
                        <Badge color={ filtersActive ? "primary" : "default" } variant="dot">
                            <Search />
                        </Badge>
                        <Typography>Buscar</Typography>
                    </Stack>
                </Box>
                {
                    [
                        userRoles.projectAdmin, userRoles.projectOpsManagement, userRoles.projectResident
                    ].includes( loggedUser?.userRole?.title ?? "" ) && (
                        <Box onClick={ addCallback }>
                            <Stack direction="column" alignItems="center">
                                <Add />
                                <Typography>Agregar</Typography>
                            </Stack>
                        </Box>
                    )
                }
                <Box onClick={ ( ) => { dispatch( logout( ) ) } }>
                    <Stack direction="column" alignItems="center">
                        <Logout />
                        <Typography>Salir</Typography>
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
};

export const RequestCard: FC<{ 
    request: Request, handleEdit: ( request: Request ) => void;
    handleDelete: ( request: Request ) => void; handleNotes: ( request: Request ) => void;
}> = ( { request, handleEdit, handleNotes, handleDelete } ) => {
    const theme = useTheme( );
    const { loggedUser } = useSelector( ( state: RootState ) => state.common );
    
    return (
        <Paper key={ request.id } sx={{ padding: "1rem", position: "relative", boxSizing: "border-box" }}>
            {
                request.notes.length > 0 && (
                    <Box sx={{
                        height: "100%", position: "absolute", backgroundColor: "orange", 
                        width: "8px", top: 0, left: 0
                    }} />
                )
            }
            <Stack direction="column" gap="0.5rem">
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="header2" fontWeight="bold">{ request.reqNumber }</Typography>
                    <Stack direction="row" gap="0.25rem">
                        <Tooltip title="Pedido retrasado">
                            <Warning sx={{ color: RequestUtils.isExpired( request ) ? theme.palette.llansaRed : theme.palette.grayBg }} />
                        </Tooltip>
                        <Tooltip title="Pedido urgente">
                            <Timer sx={{ color: request.isUrgent ? theme.palette.llansaRed : theme.palette.grayBg }} />
                        </Tooltip>
                    </Stack> 
                </Stack>
                <Divider />
                <Stack direction="column">
                    <Typography variant="body1">{ request.quantity } { request.measureUnit.title }</Typography>
                    <Typography variant="body1">{ request.item.title }</Typography>
                </Stack>
                <Stack direction="row-reverse" justifyContent="space-between">
                    <Typography variant="header2" fontWeight="bold"><Chip label={ RequestUtils.getRequestStatusLabel( request ) } /></Typography>
                </Stack>
                <Divider />
                <Stack direction="row-reverse">
                    {/*
                        <Button variant="text" onClick={ ( ) => handleInfo( request ) } sx={{ padding: 0 }}>
                            <Typography variant="header2" fontWeight="bold" textTransform="capitalize">
                                <Chip label="Info" />
                            </Typography>
                        </Button>
                    */}
                    <Button variant="text" onClick={ ( ) => handleNotes( request ) } sx={{ padding: 0 }}>
                        <Typography variant="header2" fontWeight="bold" textTransform="capitalize">
                            <Chip label="Comentarios" />
                        </Typography>
                    </Button>
                    {
                        RequestUtils.canBeEdited( { request, userRole: loggedUser?.userRole.title ?? "" } ) && (
                            <Button variant="text" onClick={ ( ) => handleEdit( request ) }>
                                <Typography variant="header2" fontWeight="bold" textTransform="capitalize">
                                    <Chip label="Editar" />
                                </Typography>
                            </Button>
                        )
                    }
                    {
                        RequestUtils.canBeDeleted( { request, userRole: loggedUser?.userRole.title ?? "" } ) && (
                            <Button variant="text" onClick={ ( ) => handleDelete( request ) }>
                                <Typography variant="header2" fontWeight="bold" textTransform="capitalize">
                                    <Chip label="Eliminar" />
                                </Typography>
                            </Button>
                        )
                    }
                </Stack>
            </Stack>
        </Paper>
    );
};

export const Paginator: FC<{
    first: ( ) => void; previous: ( ) => void;
    next: ( ) => void; last: ( ) => void;
    currentPage: number; pageCount: number;
}> = ( { first, previous, next, last, currentPage, pageCount } ) => {
    if( !pageCount )
        return null;
    
    return (
        <Paper sx={{ padding: "0.5rem" }}>
            <Stack direction="row" justifyContent="space-between" alignContent="center">
                <Box onClick={ first }><FirstPage /></Box>
                <Box onClick={ previous }><ChevronLeft /></Box>
                <Box>Página { currentPage }/{ pageCount }</Box>
                <Box onClick={ next }><ChevronRight /></Box>
                <Box onClick={ last }><LastPage /></Box>
            </Stack>
        </Paper>
    );
};
