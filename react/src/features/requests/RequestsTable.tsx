//  Third-party imports
import React, { CSSProperties, FC, Fragment, ReactNode, useEffect, useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { 
    Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, 
    DialogContentText, DialogTitle, Divider, IconButton, InputBase, Menu, 
    MenuItem, Paper, Skeleton, Snackbar, Stack, SxProps, Tab, Table, TableBody, 
    TableCell, TableContainer, TableRow, Tabs, Tooltip, Typography, useTheme 
} from "@mui/material";
import { 
    ChevronLeft, ChevronRight, Close, ContentPaste, 
    FirstPage, LastPage, Timer, Warning, Edit, Check, MoreVert,
} from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { esES } from "@mui/x-date-pickers/locales";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

//  Local imports
//  Assets
import EmptyImage from "../../assets/empty-image.png";
import TasksCompletedImg from "../../assets/completed-tasks.png";
//  Components
import Select from "../../components/inputs/Select";
import EditableItem from "../../components/inputs/EditableItem";
import { requestStatuses, userRoles } from "../../constants";
import RequestCreateModal from "../RequestCreateModal";
import EditRequestModal from "../EditRequestModal";
import RequestNotesModal from "../RequestNotesModal";
import { Request } from "../../interfaces/Models";
import { 
    DescriptionMenu, ProjectActivityMenu, ReqNumberMenu, RequestDateMenu, 
    ShoppingAssigneeMenu, ShoppingReqNumberMenu, StatusMenu, UrgentMenu 
} from "./ColumnMenus";
//  Hooks
import { useAppDispatch } from "../../hooks/hooks";
//  Utils/Other
import { CatalogOption } from "../../interfaces/Common";
import { 
    deleteRequest, getRequests as fetchRequests, RootState, setSelectedRequest, 
    shoppingAssignRequest, updateRequest, updateRequestAdmonMgmtStatus, 
    updateRequestCostStatus, updateRequestShoppingStatus, markRequestsAsCompleted 
} from "../../store/store";
import { getSearchWithFirstPage, RequestUtils } from "../../utils/Utils";
import { RequestCategory } from "../../interfaces/Common";
import { 
    RequestCard, Paginator as MobilePaginator, CardSkeleton, BottomNav as MobileBottomNav, 
    SearchModal as MobileSearchModal
} from "./mobile/Components";
import { createPortal } from "react-dom";

dayjs.extend( customParseFormat );

interface TableColumn {
    label: string;
    tooltip?: string,
    format: ( request: Request, ix: number ) => ReactNode;
    width: string;
    Menu?: ( ) => ReactNode;
    shown: boolean;
    order: number;
    Column?: ( ) => ReactNode;
    freeze?: boolean;
    isEditable?: boolean;
    zIndex?: number;
};

interface TableFilters {
    reqNumber: string;
    project: CatalogOption | null;
    activity: CatalogOption | null;
    item: string;
    isOld: CatalogOption | null;
    costStatus: CatalogOption&{ group: string; } | null;
    isUrgent: CatalogOption | null;
    assignee: CatalogOption | null;
    page: number;
    shoppingReqNumber: string;
    status: ( CatalogOption&{ group: string; } )[ ] | null;
    requestDateFrom: Dayjs | null;
    requestDateTo: Dayjs | null;
};

const initialFilterValues: TableFilters = {
    reqNumber: "", project: null, activity: null, item: "", costStatus: null,
    isUrgent: null, assignee: null, page: 1, shoppingReqNumber: "", isOld: null,
    status: null, requestDateFrom: null, requestDateTo: null
};

const RequestsTable: FC<{ category: RequestCategory, isMobile: boolean; }> = ( { category, isMobile } ) => {
    const dispatch = useAppDispatch( );
    const theme = useTheme( );
    const [ searchParams, setSearchParams ] = useSearchParams( );
    const navigate = useNavigate( );
    const { search } = useLocation( );

    const { 
        loggedUser, selectedRequest, projects, shoppingAnalysts 
    } = useSelector( ( state: RootState ) => state.common );
    
    const [ loading, setLoading ] = useState<boolean>( false );
    const [ totalRequests, setTotalRequests ] = useState<number>( 0 );
    const [ pageCount, setPageCount ] = useState<number>( 0 );
    const [ filters, setFilters ] = useState<TableFilters>( initialFilterValues );
    const [ requests, setRequests ] = useState<Request[ ]>( [ ] );
    const [ openWhReceivedDateModal, setOpenWhReceivedDateModal ] = useState<{ opened: boolean; targetStatus?: string; }>( { opened: false } );
    const [ openDeleteModal, setOpenDeleteModal ] = useState<{ opened: boolean; request: Request | null; }>( { opened: false, request: null } );
    const [ openCreateRequestModal, setOpenCreateRequestModal ] = useState<boolean>( false );
    const [ openRequestNotesModal, setOpenRequestNotesModal ] = useState<{ opened: boolean; request: Request | null; }>( { opened: false, request: null } );
    const [ snackbar, setSnackbar ] = useState<{ show: boolean; message?: string; type?: "error" | "info" | "success" | "warning", duration?: number; }>( { show: false, message: "", type: "info" } );
    const [ editModal, setEditModal ] = useState<{ opened: boolean; request: Request | null; }>( { opened: false, request: null } );
    const [ selectedRequests, setSelectedRequests ] = useState<Request[ ]>( [ ] );
    const [ completedFirstFetch, setCompletedFirstFetch ] = useState<boolean>( false );
    const [ pageLoading, setPageLoading ] = useState<boolean>( false );
    const [ showBulkEditModal, setShowBulkEditModal ] = useState<boolean>( false );
    const [ lastSelectedRequest, setLastSelectedRequest ] = useState<Request | null>( null );
    const [ showQuickSearch, setShowQuickSearch ] = useState<boolean>( false );
    const [ cxAnchorEl, setCxAnchorEl ] = useState<null | HTMLElement>( null );
    const [ contextRequest, setContextRequest ] = useState<Request | null>( null );
    const [ showMobileSearch, setShowMobileSearch ] = useState<boolean>( false );

    const tableEl = document.getElementById( "requests-table" );

    let statusOptions = [
        { id: requestStatuses.costStatuses.pending.id, label: requestStatuses.costStatuses.pending.label, group: "Costos" },
        { id: requestStatuses.costStatuses.inquiry.id, label: requestStatuses.costStatuses.inquiry.label, group: "Costos" },
        { id: requestStatuses.costStatuses.cancelled.id, label: requestStatuses.costStatuses.cancelled.label, group: "Costos" },
        { id: requestStatuses.costStatuses.reviewed.id, label: requestStatuses.costStatuses.reviewed.label, group: "Costos" },

        { id: requestStatuses.shoppingStatuses.quoting.id, label: requestStatuses.shoppingStatuses.quoting.label, group: "Compras" },
        { id: requestStatuses.shoppingStatuses.purchaseOrder.id, label: requestStatuses.shoppingStatuses.purchaseOrder.label, group: "Compras" },
        { id: requestStatuses.shoppingStatuses.checkAwait.id, label: requestStatuses.shoppingStatuses.checkAwait.label, group: "Compras" },
        { id: requestStatuses.shoppingStatuses.checkReceived.id, label: requestStatuses.shoppingStatuses.checkReceived.label, group: "Compras" },
        { id: requestStatuses.shoppingStatuses.transportAwait.id, label: requestStatuses.shoppingStatuses.transportAwait.label, group: "Compras" },
        { id: requestStatuses.shoppingStatuses.deliveredCentralWH.id, label: requestStatuses.shoppingStatuses.deliveredCentralWH.label, group: "Compras" },
        { id: requestStatuses.shoppingStatuses.finished.id, label: requestStatuses.shoppingStatuses.finished.label, group: "Compras" },
        { id: requestStatuses.shoppingStatuses.changesRequested.id, label: requestStatuses.shoppingStatuses.changesRequested.label, group: "Compras" },
        { id: requestStatuses.shoppingStatuses.changesPerformed.id, label: requestStatuses.shoppingStatuses.changesPerformed.label, group: "Compras" },
        { id: requestStatuses.shoppingStatuses.cancelled.id, label: requestStatuses.shoppingStatuses.cancelled.label, group: "Compras" },
        { id: requestStatuses.shoppingStatuses.internalTransfer.id, label: requestStatuses.shoppingStatuses.internalTransfer.label, group: "Compras" },
        { id: requestStatuses.shoppingStatuses.cashPayment.id, label: requestStatuses.shoppingStatuses.cashPayment.label, group: "Compras" },

        { id: requestStatuses.admonStatuses.checkSignature.id, label: requestStatuses.admonStatuses.checkSignature.label, group: "Administración" },
        { id: requestStatuses.admonStatuses.checkDelivered.id, label: requestStatuses.admonStatuses.checkDelivered.label, group: "Administración" },
        { id: requestStatuses.admonStatuses.accounting.id, label: requestStatuses.admonStatuses.accounting.label, group: "Administración" },
    ];

    if( [ 
        userRoles.shoppingAnalyst, userRoles.shoppingChief, userRoles.projectAdmin, 
        userRoles.projectOpsManagement, userRoles.projectResident 
    ].includes( loggedUser?.userRole?.title ?? "" ) ) {
        statusOptions = statusOptions.filter( s => s.group == "Compras" );
    }
    
    if( [ userRoles.costChief ].includes( loggedUser?.userRole?.title ?? "" ) ) {
        statusOptions = statusOptions.filter( s => s.group == "Costos" );
    }
    
    if( [ userRoles.adminManagement ].includes( loggedUser?.userRole?.title ?? "" ) ) {
        statusOptions = statusOptions.filter( s => s.group == "Compras" || s.group == "Administración" );
    }

    const cxOpen = !!cxAnchorEl;
    const userRole = loggedUser?.userRole?.title ?? null;

    useEffect( ( ) => {
        const handleKeyDown = ( event: KeyboardEvent ) => {
            if( event.repeat )
                return;
            
            if ( event.ctrlKey && event.key === 'b' ) {
                setShowQuickSearch( p => !p );
                event.preventDefault( );
            }
        };
      
        window.addEventListener( 'keydown', handleKeyDown );
      
        return () => {
            window.removeEventListener( 'keydown', handleKeyDown );
        };
    }, [ ] );
    
    useEffect( ( ) => {
        const reqNumber = searchParams.get( "f_reqnumber" ) ?? "";
        const shoppingReqNumber = searchParams.get( "f_shopreqn" ) ?? "";
        const item = searchParams.get( "f_item" ) ?? "";
        let page = searchParams.get( "f_page" ) ? Number( searchParams.get( "f_page" ) ) : 1;
        
        const projectId: number | null = searchParams.get( "f_project" ) ? Number( searchParams.get( "f_project" ) ) : null;
        let project: CatalogOption | null = null;

        const activityId: number | null = searchParams.get( "f_activity" ) ? Number( searchParams.get( "f_activity" ) ) : null;
        let activity: CatalogOption | null = null;

        const priorityId: number | null = searchParams.get( "f_priority" ) ? Number( searchParams.get( "f_priority" ) ) : null;
        let isUrgent: CatalogOption | null = null;

        const statusId: string | null = searchParams.getAll( "f_status" ) ? String( searchParams.getAll( "f_status" ) ) : null;
        let status: CatalogOption[ ] | null = null;

        const expiredId: number | null = searchParams.get( "f_expired" ) ? Number( searchParams.get( "f_expired" ) ) : null;
        let isOld: CatalogOption | null = null;

        const assigneeId: number | null = searchParams.get( "f_shopassign" ) ? Number( searchParams.get( "f_shopassign" ) ) : null;
        let assignee: CatalogOption | null = null;

        const reqDateFrom: string | null = searchParams.get( "f_reqdfrom" ) ? String( searchParams.get( "f_reqdfrom" ) ) : null;
        const reqDateFromDate: Dayjs | null = reqDateFrom ? dayjs( reqDateFrom, "DD-MM-YYYY" ) : null;

        const reqDateTo: string | null = searchParams.get( "f_reqdto" ) ? String( searchParams.get( "f_reqdto" ) ) : null;
        const reqDateToDate: Dayjs | null = reqDateTo ? dayjs( reqDateTo, "DD-MM-YYYY" ) : null;
        if( projectId ) {
            project = { id: projectId, label: "" };
        }
        
        if( activityId ) {
            activity = { id: activityId, label: "" };
        }
        
        if( statusId ) {
            const statusIds = statusId.split( "," );
            status = statusIds.map( s => ( { id: s, label: statusOptions.find( so => so.id == s )!.label ?? "" } ) ) ?? null;
        }
        
        if( priorityId !== null ) {
            let label = "";
            
            if( priorityId === 0 )
                label = "Normal";

            if( priorityId === 1 )
                label = "Urgente"

            isUrgent = { id: priorityId, label };
        }
        
        if( expiredId !== null ) {
            let label = "";
            
            if( expiredId === 0 )
                label = "A tiempo";

            if( expiredId === 1 )
                label = "Retrasado"

            isOld = { id: expiredId, label };
        }
        
        if( assigneeId ) {
            assignee = { id: assigneeId, label: "" };
        }
        
        if( isNaN( page ) )
            page = 1;
        
        setFilters( prev => ( { 
            ...prev, reqNumber, shoppingReqNumber, page, 
            project: project as CatalogOption,
            activity: activity as CatalogOption,
            item,
            assignee: assignee as CatalogOption,
            isUrgent: isUrgent as CatalogOption,
            isOld: isOld as CatalogOption,
            status: status as ( CatalogOption&{ group: string } )[ ],
            requestDateFrom: reqDateFromDate, requestDateTo: reqDateToDate
        } ) );
    }, [ ] );

    useEffect( ( ) => {
        if( projects.length > 0 ) {
            const project = projects.find( p => p.id == filters.project?.id ) ?? null;
            const activity = project?.activities.find( a => a.id == filters.activity?.id ) ?? null;
            
            setFilters( prev => ( { ...prev, project, activity } ) );
        }
    }, [ projects ] );
    
    useEffect( ( ) => {
        if( shoppingAnalysts.length > 0 ) {
            const assignee = shoppingAnalysts.find( p => p.id == filters.assignee?.id ) ?? null;
            
            setFilters( prev => ( { ...prev, assignee } ) );
        }
    }, [ shoppingAnalysts ] );
    
    useEffect( ( ) => {
        if( filters === initialFilterValues )
            return;

        const { reqNumber, page, project, activity, shoppingReqNumber, item, assignee, isUrgent, isOld, status, requestDateFrom, requestDateTo } = filters;
        const queryParams: { [ key: string ]: string } = { };

        if( reqNumber ) {
            queryParams[ "f_reqnumber" ] = reqNumber;
        }

        if( requestDateFrom ) {
            queryParams[ "f_reqdfrom" ] = dayjs( requestDateFrom ).format( "DD-MM-YYYY" );
        }

        if( requestDateTo ) {
            queryParams[ "f_reqdto" ] = dayjs( requestDateTo ).format( "DD-MM-YYYY" );
        }

        if( shoppingReqNumber ) {
            queryParams[ "f_shopreqn" ] = shoppingReqNumber;
        }

        if( page ) {
            queryParams[ "f_page" ] = String( page );
        }

        if( project?.id ) {
            queryParams[ "f_project" ] = String( project.id );
        }

        if( status?.length ) {
            queryParams[ "f_status" ] = String( status.map( s => s.id ).join( "," ) );
        }

        if( activity?.id ) {
            queryParams[ "f_activity" ] = String( activity.id );
        }

        if( item ) {
            queryParams[ "f_item" ] = item;
        }

        if( isUrgent && isUrgent?.id !== null ) {
            queryParams[ "f_priority" ] = String( isUrgent.id );
        }

        if( isOld && isOld?.id !== null ) {
            queryParams[ "f_expired" ] = String( isOld.id );
        }

        if( assignee?.id ) {
            queryParams[ "f_shopassign" ] = String( assignee.id );
        }

        setSearchParams( queryParams );
        loadRequests( );
    }, [ filters ] );

    const handleCreateRequest = ( ) => {
        loadRequests( );
    };

    const tableScrollTop = ( ) => {
        if( tableEl )
            tableEl.scrollTop = 0;
    }

    const handleFirstPage = ( ) => {
        if( filters.page > 1 ) {
            setFilters( prev => ( { ...prev, page: 1 } ) );
            setPageLoading( true );
        }
    };
    const handleNextPage = ( ) => {
        if( filters.page < pageCount ) {
            setFilters( prev => ( { ...prev, page: prev.page + 1 } ) );
            setPageLoading( true );
        }
    };
    const handlePreviousPage = ( ) => {
        if( filters.page > 1 ) {
            setFilters( prev => ( { ...prev, page: prev.page - 1 } ) );
            setPageLoading( true );
        }
    };
    const handleLastPage = ( ) => {
        if( filters.page < pageCount ) {
            setFilters( prev => ( { ...prev, page: pageCount } ) );
            setPageLoading( true );
        }
    };

    const handleReqNumberFilter = ( reqNumber: string ) => {
        setFilters( prev => ( { ...prev, reqNumber, page: 1 } ) );
    };

    const handleShopReqNumberFilter = ( shopReqNumber: string ) => {
        setFilters( prev => ( { ...prev, shoppingReqNumber: shopReqNumber, page: 1 } ) );
    };

    const handleProjectActivityFilter = ( value: { project: CatalogOption | null, activity: CatalogOption | null } ) => {
        setFilters( prev => ( { ...prev, project: value.project, activity: value.activity, page: 1 } ) );
    };

    const handleItemFilter = ( value: string ) => {
        setFilters( prev => ( { ...prev, item: value, page: 1 } ) );
    };

    const handlePriorityFilter = ( value: { isUrgent: CatalogOption | null, isOld: CatalogOption | null } ) => {
        setFilters( prev => ( { ...prev, isUrgent: value.isUrgent, isOld: value.isOld, page: 1 } ) );
    };

    const handleStatusFilter = ( value: { status: ( CatalogOption&{ group: string; } )[ ] | null } ) => {
        setFilters( prev => ( { ...prev, status: value.status, page: 1 } ) );
    };

    const handleShopAssigneeFilter = ( value: { assignee: CatalogOption | null } ) => {
        setFilters( prev => ( { ...prev, assignee: value.assignee, page: 1 } ) );
    };

    const handleRequestDateFilter = ( value: { from: Dayjs | null, to: Dayjs | null } ) => {
        setFilters( prev => ( { ...prev, requestDateFrom: value.from, requestDateTo: value.to } ) );
    };

    const showSnackbar = ( { message, type, duration }: { message: string; type?: "error" | "info" | "success" | "warning", duration?: number } ) => {
        setSnackbar( { show: true, message, type, duration } );
    }

    const handleRemoveRequest = ( req: Request ) => {
        dispatch( deleteRequest( req.id ) )
        .then( r => {
            if( r.meta.requestStatus == "fulfilled" ) {
                loadRequests( );
                setOpenDeleteModal( p => ( { ...p, opened: false, request: null } ) );
                showSnackbar( { message: "Solicitud eliminada", type: "success" } );
            }
        } );
    };

    const handleClickListItem = ( event: React.MouseEvent<HTMLElement>, request: Request ) => {
        setCxAnchorEl( event.currentTarget );
        setContextRequest( request );
    };
    
    const handleMenuItemClick = ( ) => {
        setCxAnchorEl( null );
    };

    const handleClose = ( ) => {
        setCxAnchorEl( null );
    }

    /*const handleRequestEditBtn = ( request: Request ) => {
        setEditModal( { opened: true, request } );
    };

    const handleRequestDeleteBtn = ( ) => {};

    const handleRequestNotesBtn = ( ) => {};*/

    const loadRequests = ( ) => {
        setLoading( true );

        const requestFilters: { 
            reqNumber: string | undefined, 
            shoppingReqNumber: string | undefined;
            project: number | undefined,
            activity: number | undefined,
            item: string | undefined,
            status: string | undefined,
            isUrgent: number | undefined,
            assignee: number | undefined,
            isOld: number | undefined,
            reqDateFrom?: string, reqDateTo?: string
        } = { reqNumber: undefined, project: undefined, activity: undefined, item: undefined, status: undefined, isUrgent: undefined, assignee: undefined, shoppingReqNumber: undefined, isOld: undefined, reqDateFrom: undefined, reqDateTo: undefined };

        if( filters.reqNumber ) {
            requestFilters.reqNumber = filters.reqNumber;
        } else {
            requestFilters.reqNumber = undefined;
        }

        if( filters.shoppingReqNumber ) {
            requestFilters.shoppingReqNumber = filters.shoppingReqNumber;
        } else {
            requestFilters.shoppingReqNumber = undefined;
        }

        if( filters.project && filters.project.id ) {
            requestFilters.project = Number( filters.project.id );
        } else {
            requestFilters.project = undefined;
        }
		
        if( filters.activity && filters.activity.id ) {
            requestFilters.activity = Number( filters.activity.id );
        } else {
            requestFilters.activity = undefined;
        }
		
        if( filters.item ) {
            requestFilters.item = filters.item;
        } else {
            requestFilters.item = undefined;
        }

        if( filters.status && filters.status.length ) {
            requestFilters.status = String( filters.status.map( s => s.id ).join( "," ) );
        } else {
            requestFilters.status = undefined;
        }
		
        if( filters.assignee && filters.assignee.id ) {
            requestFilters.assignee = Number( filters.assignee.id );
        } else {
            requestFilters.assignee = undefined;
        }
		
        if( filters.isUrgent && filters.isUrgent.id !== null ) {
            requestFilters.isUrgent = Number( filters.isUrgent.id );
        } else {
            requestFilters.isUrgent = undefined;
        }
		
        if( filters.isOld && filters.isOld.id !== null ) {
            requestFilters.isOld = Number( filters.isOld.id );
        } else {
            requestFilters.isOld = undefined;
        }

        if( filters.requestDateFrom )
            requestFilters.reqDateFrom = dayjs( filters.requestDateFrom ).format( "DD-MM-YYYY" );

        if( filters.requestDateTo )
            requestFilters.reqDateTo = dayjs( filters.requestDateTo ).format( "DD-MM-YYYY" );
		
        dispatch( fetchRequests( {
            page: filters.page,
            filters: requestFilters,
            category
        } ) )
        .then( r => {
            if( r.meta.requestStatus == "fulfilled" ) {
                const payload = r.payload as never;
                const { data, total, pages } = payload;

                setRequests( ( data as Request[ ] ) );
                setTotalRequests( total as number );
                setPageCount( pages as number );
            }
        } )
        .finally( ( ) => {
            setLoading( false );
            setCompletedFirstFetch( true );

            if( pageLoading ) {
                tableScrollTop( );
                setPageLoading( false );
            }
        } );
    };

    const textStyles: CSSProperties = { cursor: "text", width: "fit-content" };

    const StatusChip: FC<{ label: string; backgroundColor?: string; sx?: CSSProperties; }> = ( { label, backgroundColor = theme.palette.pureWhite, sx = {} } ) => (
        <Chip variant="outlined" label={ label } sx={{ backgroundColor, ...sx, borderRadius: 0 }} />
    );

    const WHReceivedDateModal: FC<{ 
        opened: boolean; toggler: ( ) => void; 
        handleConfirm: ( receivedDate: Dayjs ) => void; 
    }> = ( { opened, toggler, handleConfirm } ) => {
        const [ whReceivedDate, setWhReceivedDate ] = useState<Dayjs>( dayjs( ) );
        
        return (
            <Dialog
                open={ opened }
                onClose={ ( ) => { toggler( ); } }
            >
                <DialogTitle>Confirmar finalización</DialogTitle>
                <DialogContent>
                    <Stack direction="column" spacing={1}>
                        <Typography variant="body1">Fecha de recepción en bodega</Typography>
                        <LocalizationProvider dateAdapter={ AdapterDayjs } localeText={ esES.components.MuiLocalizationProvider.defaultProps.localeText }>
                            <DatePicker 
                                value={ whReceivedDate } 
                                onChange={v => setWhReceivedDate( v as Dayjs ) } 
                                sx={{
                                    "& .MuiInputBase-root": { borderRadius: "25px" }
                                }} 
                                slotProps={{
                                    day: { sx: { backgroundColor: "transparent !important", color: "black !important" } }
                                }} 
                                closeOnSelect 
                                format="DD/MM/YYYY"
                            />
                        </LocalizationProvider>
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
                            handleConfirm( whReceivedDate );
                            toggler( );
                        } }
                    >Finalizar</Button>
                </DialogActions>
            </Dialog>
    	);
    };

    const RequestDeleteModal: FC = ( ) => {
        return (
            <Dialog
                open={ openDeleteModal.opened && !!openDeleteModal.request }
                onClose={ ( ) => setOpenDeleteModal( p => ( { ...p, opened: false, request: null } ) ) }
            >
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent><DialogContentText>
                    <Typography variant="body1">¿Seguro que desea eliminar la solicitud de material?</Typography>
                    <Divider sx={{ margin: "0.5rem 0" }} />
                    <Typography variant="body1">#{ openDeleteModal.request?.reqNumber } { openDeleteModal.request?.item.title }</Typography>
                </DialogContentText></DialogContent>
                <DialogActions>
                    <Button 
                        sx={{ backgroundColor: "transparent !important", color: "black" }}
                        onClick={ ( ) => { setOpenDeleteModal( p => ( { ...p, opened: false, request: null } ) ) } }
                    >Cancelar</Button>
                    <Button 
                        sx={{ backgroundColor: `${ theme.palette.llansaRed } !important`, color: "white" }}
                        onClick={ ( ) => {
                            if( openDeleteModal.request )
                                handleRemoveRequest( openDeleteModal.request );
                        } }
                    >Eliminar</Button>
                </DialogActions>
            </Dialog>
        );
    };

    const BulkEditModal: FC<{ 
        opened: boolean; toggler: ( ) => void; 
        handleConfirm: ( data: Partial<Request>&{ status?: string; additionalData?: { whReceivedDate?: Date; }; } ) => void; 
    }> = ( { opened, toggler, handleConfirm } ) => {
    	const [ ocNumber, setOcNumber ] = useState<string>( "" );
    	const [ selectedStatus, setSelectedStatus ] = useState<CatalogOption | null>( null );
    	const [ saveDisabled, setSaveDisabled ] = useState<boolean>( false );
        const [ whReceivedDate, setWhReceivedDate ] = useState<Dayjs>( dayjs( ) );
        const [ willFinish, setWillFinish ] = useState<boolean>( false );

    	useEffect( ( ) => {
    		if( !ocNumber.trim( ) && !selectedStatus ) {
    			setSaveDisabled( true );
            } else {
    			setSaveDisabled( false );
            }

            if( 
                typeof selectedStatus?.id == "string" && 
                [
                    requestStatuses.shoppingStatuses.finished.id,
                    requestStatuses.shoppingStatuses.internalTransfer.id
                ].includes( selectedStatus?.id )
            ) {
                setWillFinish( true );
            }
    	}, [ ocNumber, selectedStatus ] );
        
    	return (
    		<Dialog
    			open={ opened }
    			onClose={ ( ) => { toggler( ); } }
    		>
    			<DialogTitle>Modificar selección</DialogTitle>
    			<DialogContent>
    				<Stack direction="column" spacing={1}>
                        {
                            [ userRoles.shoppingAnalyst, userRoles.shoppingChief ].includes( loggedUser?.userRole?.title ?? "" ) && (
                                <Fragment>
                                    <Typography variant="body1">Nº de Solicitud/OC</Typography>
                                    <InputBase
                                        sx={{ ml: 0, flex: 1, wordWrap: 'break-word', overflowWrap: "break-word", border: `solid 1px ${ theme.palette.grayBg }` }}
                                        multiline
                                        minRows={ 1 }
                                        value={ ocNumber }
                                        onChange={ e => setOcNumber( e.target.value ) }
                                    />
                                </Fragment>
                            )
                        }
    					<Typography variant="body1">Estatus</Typography>
    					<Select
    						options={ statusOptions }
    						value={ selectedStatus }
    						handleChange={ e => {
    							setSelectedStatus( e as CatalogOption );
    						}}
    						sx={{ marginTop: "0", maxWidth: "250px" }} 
    						noSelectionText="-- Seleccionar --"
    					/> 
                        {
                            willFinish && (
                                <Fragment>
                                    <Typography variant="body1">Fecha de recepción en bodega</Typography>
                                    <LocalizationProvider dateAdapter={ AdapterDayjs } localeText={ esES.components.MuiLocalizationProvider.defaultProps.localeText }>
                                        <DatePicker 
                                            value={ whReceivedDate } 
                                            onChange={v => setWhReceivedDate( v as Dayjs ) } 
                                            sx={{
                                                maxWidth: "250px"
                                            }} 
                                            slotProps={{
                                                day: { sx: { backgroundColor: "transparent !important", color: "black !important" } }
                                            }} 
                                            closeOnSelect 
                                            format="DD/MM/YYYY"
                                        />
                                    </LocalizationProvider>
                                </Fragment>
                            )
                        }
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
    						const trimmedOcNumber = ocNumber.trim( );

    						handleConfirm( { 
    							shoppingReqNumber: trimmedOcNumber ? trimmedOcNumber : undefined,
    							status: selectedStatus ? ( selectedStatus.id as string ) : undefined,
                                additionalData: { whReceivedDate: whReceivedDate.toDate( ) }
    						} );

    						toggler( );
    					} }
    					disabled={ saveDisabled }
    				>Guardar</Button>
    			</DialogActions>
    		</Dialog>
    	);
    };

    const QuickSearchModal: FC<{ 
        opened: boolean; toggler: ( ) => void; 
        handleConfirm: ( data: { reqNumber: string; } ) => void; 
    }> = ( { opened, toggler, handleConfirm } ) => {
    	const [ reqNumber, setReqNumber ] = useState<string>( "" );

        const inputRef = useRef<HTMLInputElement>( null );

        useEffect( ( ) => {
            if( opened ) {
                const timer = setTimeout( () => {
                    inputRef.current?.focus();
                }, 100 );
            
                return () => clearTimeout( timer );
                
            }
        }, [ opened ] );

        const submit = ( ) => {
            const trimmedReqNumber = reqNumber.trim( );

            handleConfirm( { reqNumber: trimmedReqNumber } );

            toggler( );
        };
        
    	return (
    		<Dialog
    			open={ opened }
    			onClose={ ( ) => { toggler( ); } }
    		>
    			<DialogTitle>Búsqueda rápida</DialogTitle>
    			<DialogContent>
    				<Stack direction="column" spacing={1}>
    					<Typography variant="body1">Nº de Pedido</Typography>
    					<InputBase
    						sx={{ ml: 0, flex: 1, wordWrap: 'break-word', overflowWrap: "break-word", border: `solid 1px ${ theme.palette.grayBg }` }}
    						value={ reqNumber }
                            onKeyUp={ e => {
                                if( e.key === "Enter" ) {
                                    submit( );
                                }
                            } }
    						onChange={ e => { 
                                setReqNumber( e.target.value );
                            } }
                            inputRef={ inputRef }
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

    const STATUS_SELECTOR_STYLING: SxProps = { 
        marginTop: "0",
        ".MuiOutlinedInput-root": { fontSize: "14px", height: "35px" },
        backgroundColor: theme.palette.pureWhite
    };

    const handleRequestUpdate = ( requestId: number, newStatus: string, additionalData?: { whReceivedDate?: Date } ) => {
        dispatch( updateRequestShoppingStatus( { requestId, status: newStatus, additionalData } ) )
        .then( r => {
            if( r.meta.requestStatus == "fulfilled" ) {
                const updatedRequest = r.payload as Request;
                const newRequests = Object.assign( [], requests ) as Request[ ];

                const matchingRequest = Object.assign( {}, newRequests.find( e => e.id == updatedRequest.id ) );
                const matchingRequestIx = newRequests.findIndex( e => e.id == updatedRequest.id );

                if( matchingRequest?.shoppingStatus || matchingRequest?.shoppingStatus === null ) {
                    matchingRequest.shoppingStatus = updatedRequest.shoppingStatus;
                    matchingRequest.shoppingDateFinished = updatedRequest.shoppingDateFinished;
                }

                newRequests.splice( matchingRequestIx, 1, matchingRequest );

                setRequests( newRequests );
                showSnackbar( { message: "Solicitud actualizada", type: "success" } );

                loadRequests( );
            }
        } );                        
    };

    const getManagementStatusChip: ( req: Request ) => JSX.Element = ( req ) => {
        const admonMgmtStatusOptions = [
            { id: requestStatuses.admonStatuses.received.id, label: requestStatuses.admonStatuses.received.label },
            { id: requestStatuses.admonStatuses.checkSignature.id, label: requestStatuses.admonStatuses.checkSignature.label },
            { id: requestStatuses.admonStatuses.checkDelivered.id, label: requestStatuses.admonStatuses.checkDelivered.label },
            { id: requestStatuses.admonStatuses.accounting.id, label: requestStatuses.admonStatuses.accounting.label },
        ];
        const shoppingStatusOptions = [
            { id: requestStatuses.shoppingStatuses.quoting.id, label: requestStatuses.shoppingStatuses.quoting.label },
            { id: requestStatuses.shoppingStatuses.purchaseOrder.id, label: requestStatuses.shoppingStatuses.purchaseOrder.label },
            { id: requestStatuses.shoppingStatuses.checkAwait.id, label: requestStatuses.shoppingStatuses.checkAwait.label },
            { id: requestStatuses.shoppingStatuses.checkReceived.id, label: requestStatuses.shoppingStatuses.checkReceived.label },
            { id: requestStatuses.shoppingStatuses.transportAwait.id, label: requestStatuses.shoppingStatuses.transportAwait.label, color: theme.palette.green },
            { id: requestStatuses.shoppingStatuses.deliveredCentralWH.id, label: requestStatuses.shoppingStatuses.deliveredCentralWH.label, color: theme.palette.green },
            { id: requestStatuses.shoppingStatuses.finished.id, label: requestStatuses.shoppingStatuses.finished.label, color: theme.palette.green },
            { id: requestStatuses.shoppingStatuses.changesRequested.id, label: requestStatuses.shoppingStatuses.changesRequested.label },
            { id: requestStatuses.shoppingStatuses.changesPerformed.id, label: requestStatuses.shoppingStatuses.changesPerformed.label },
            { id: requestStatuses.shoppingStatuses.cancelled.id, label: requestStatuses.shoppingStatuses.cancelled.label, color: theme.palette.green },
            { id: requestStatuses.shoppingStatuses.internalTransfer.id, label: requestStatuses.shoppingStatuses.internalTransfer.label, color: theme.palette.green },
            { id: requestStatuses.shoppingStatuses.cashPayment.id, label: requestStatuses.shoppingStatuses.cashPayment.label }
        ];

        const matchingAdmonMgmtStatus = Object.values( requestStatuses.admonStatuses ).find( s => s.id == req.admonStatus ) ?? null;
        const matchingShoppingStatus: { id: string; label: string; color?: string; } | null = Object.values( shoppingStatusOptions ).find( s => s.id == req.shoppingStatus ) ?? null;

        if( loggedUser?.userRole?.title === userRoles.adminManagement ) {
            return (
                <Box onClick={ e => e.stopPropagation( ) }>
                    <Stack direction="column" gap="0.5rem">
                        {
                            matchingShoppingStatus && (
                                <StatusChip label={ matchingShoppingStatus?.label ?? "Desconocido" } backgroundColor={ theme.palette.pureWhite } sx={{ width: "fit-content", borderRadius: 0 }} />
                            )
                        }
                        <Select
                            options={ admonMgmtStatusOptions }
                            value={ matchingAdmonMgmtStatus }
                            disableClearable
                            handleChange={ e => {
                                const { id: requestId } = req;
                                const { id: newStatus } = e as CatalogOption;

                                dispatch( updateRequestAdmonMgmtStatus( { id: requestId, status: newStatus as string } ) )
                                .then( r => {
                                    if( r.meta.requestStatus == "fulfilled" ) {
                                        const updatedRequest = r.payload as Request;
                                        const newRequests = Object.assign( [], requests ) as Request[ ];

                                        const matchingRequest = Object.assign( {}, newRequests.find( e => e.id == updatedRequest.id ) );
                                        const matchingRequestIx = newRequests.findIndex( e => e.id == updatedRequest.id );

                                        if( matchingRequest?.admonStatus || matchingRequest?.admonStatus === null )
                                            matchingRequest.admonStatus = updatedRequest.admonStatus;

                                        newRequests.splice( matchingRequestIx, 1, matchingRequest );

                                        setRequests( newRequests );
                                        showSnackbar( { message: "Solicitud actualizada", type: "success" } );
                                    }
                                } );                        
                            }}
                            sx={ STATUS_SELECTOR_STYLING } 
                            noSelectionText="-- Seleccionar --"
                        /> 
                    </Stack>
                </Box>
            );
        } 
        
        if( [ userRoles.shoppingAnalyst, userRoles.shoppingChief ].includes( loggedUser?.userRole?.title ?? "" ) && req.assignee?.id == loggedUser?.id ) {
            return (
                <Box onClick={ e => e.stopPropagation( ) }>
                    <Stack direction="column" gap="0.5rem">
                        <Select
                            options={ shoppingStatusOptions }
                            value={ matchingShoppingStatus }
                            disableClearable
                            handleChange={ e => {
                                const { id: requestId } = req;
                                const { id: newStatus } = e as CatalogOption;

                                if( !newStatus )
                                    return;
        
                                if( 
                                    typeof newStatus == "string" && 
                                    [
                                        requestStatuses.shoppingStatuses.finished.id,
                                        requestStatuses.shoppingStatuses.internalTransfer.id
                                    ].includes( newStatus as string )
                                ) {
                                    if( 
                                        newStatus == requestStatuses.shoppingStatuses.finished.id &&
                                        !req.shoppingReqNumber
                                    ) {
                                        showSnackbar( { 
                                            message: "Debe ingresar un valor en Nº de Solicitud/OC", 
                                            type: "error", 
                                            duration: 3000
                                        } );
                                        return;
                                    }
                                    
                                    dispatch( setSelectedRequest( req ) );
                                    setOpenWhReceivedDateModal( { opened: true, targetStatus: newStatus } );
                                } else {
                                    handleRequestUpdate( requestId, String( newStatus ) );
                                }
                            }}
                            sx={ STATUS_SELECTOR_STYLING } 
                            noSelectionText="-- Seleccionar --"
                        /> 
                        {
                            matchingAdmonMgmtStatus && (
                                <StatusChip label={ matchingAdmonMgmtStatus?.label ?? "Desconocido" } backgroundColor={ theme.palette.pureWhite } sx={{ width: "fit-content", borderRadius: "0" }} />
                            )
                        }
                    </Stack>
                </Box>
            );
        } 

        return (
            <Stack direction="column" gap="0.5rem">
                {
                    matchingShoppingStatus && (
                        <StatusChip label={ matchingShoppingStatus?.label ?? "Desconocido" } backgroundColor={ theme.palette.pureWhite } sx={{ width: "fit-content", backgroundColor: matchingShoppingStatus.color ?? theme.palette.pureWhite }} />
                    )
                }
                {
                    matchingAdmonMgmtStatus && 
                    ![ userRoles.projectAdmin, userRoles.projectOpsManagement, userRoles.projectResident ].includes( loggedUser?.userRole.title ?? "" ) && 
                    (
                        <StatusChip label={ matchingAdmonMgmtStatus?.label ?? "Desconocido" } backgroundColor={ theme.palette.pureWhite } sx={{ width: "fit-content" }} />
                    )
                }
            </Stack>
        );
    };

    const getCostStatusChip: ( request: Request ) => JSX.Element = ( request ) => {
        const costStatusOptions = [
            { id: requestStatuses.costStatuses.pending.id, label: requestStatuses.costStatuses.pending.label },
            { id: requestStatuses.costStatuses.reviewed.id, label: requestStatuses.costStatuses.reviewed.label },
            { id: requestStatuses.costStatuses.inquiry.id, label: requestStatuses.costStatuses.inquiry.label },
            { id: requestStatuses.costStatuses.cancelled.id, label: requestStatuses.costStatuses.cancelled.label },
        ];
        const matchingCostStatus = costStatusOptions.find( s => s.id == request?.costStatus ) ?? null;
        
        if( loggedUser?.userRole?.title === userRoles.costChief ) {
            return (
                <Box onClick={ e => e.stopPropagation( ) }>
                    <Select
                        options={ costStatusOptions }
                        value={ matchingCostStatus }
                        disableClearable
                        handleChange={ e => {
                            const { id: requestId } = request;
                            const { id: newStatus } = e as CatalogOption;
    
                            dispatch( updateRequestCostStatus( { id: requestId, status: newStatus as string } ) )
                            .then( r => {
                                if( r.meta.requestStatus == "fulfilled" ) {
                                    const updatedRequest = r.payload as Request;
                                    const newRequests = Object.assign( [], requests ) as Request[ ];
    
                                    const matchingRequest = Object.assign( {}, newRequests.find( e => e.id == updatedRequest.id ) );
                                    const matchingRequestIx = newRequests.findIndex( e => e.id == updatedRequest.id );
    
                                    if( matchingRequest?.costStatus || matchingRequest?.costStatus === null )
                                        matchingRequest.costStatus = updatedRequest.costStatus;
    
                                    newRequests.splice( matchingRequestIx, 1, matchingRequest );
    
                                    setRequests( newRequests );
                                    showSnackbar( { message: "Solicitud actualizada", type: "success" } );
                                    loadRequests( );
                                }
                            } );                        
                        }}
                        sx={ STATUS_SELECTOR_STYLING } 
                        noSelectionText="-- Seleccionar --"
                    /> 
                </Box>
            );            
        } else {
            return <StatusChip label={ matchingCostStatus?.label ?? "Desconocido" } backgroundColor={ theme.palette.pureWhite } />;
        }
    };

    const getStatusChip: ( request: Request ) => JSX.Element = ( request ) => {        
        if( request?.costStatus !== null && ( request?.shoppingStatus !== null || request?.admonStatus !== null || [ userRoles.shoppingAnalyst, userRoles.shoppingChief ].includes( loggedUser?.userRole.title ?? "" ) ) ) {
            return getManagementStatusChip( request );
        }

        return getCostStatusChip( request );        
    };

    const getAssigneeChip: ( request: Request ) => JSX.Element = ( request ) => {        
        let label = "";
        const backgroundColor = theme.palette.pureWhite;

        if( loggedUser?.userRole?.title === userRoles.shoppingChief ) {
            const matchingAssignee = shoppingAnalysts.find( a => a.id == request?.assignee?.id ) ?? null;
            
            return (
                <Box onClick={ e => e.stopPropagation( ) }>
                    <Select
                        options={ shoppingAnalysts }
                        value={ matchingAssignee }
                        handleChange={ selectedUser => {
                            const { id: requestId } = request;
                            const { id: userId } = selectedUser as CatalogOption;
    
                            dispatch( shoppingAssignRequest( { userId: userId as number | null, requestId } ) )
                            .then( r => {
                                if( r.meta.requestStatus == "fulfilled" ) {
                                    const updatedRequest = r.payload as Request;
                                    const newRequests = Object.assign( [], requests ) as Request[ ];
    
                                    const matchingRequest = newRequests.find( e => e.id == updatedRequest.id );
    
                                    if( matchingRequest?.assignee || matchingRequest?.assignee === null ) {
                                        matchingRequest.assignee = updatedRequest.assignee;
                                        matchingRequest.shoppingDateReceived = updatedRequest.shoppingDateReceived;
                                        showSnackbar( { 
                                            message: matchingRequest.assignee ? "Solicitud asignada" : "Solicitud liberada",
                                            type: "success"
                                        } );
                                    }
    
                                    setRequests( newRequests );
                                    loadRequests( );
                                }    
                            } );                        
                        }}
                        sx={{ marginTop: "0", ".MuiOutlinedInput-root": { fontSize: "14px", height: "35px" } }} 
                        noSelectionText="-- Sin Asignar --"
                    /> 
                </Box>
            );        
        } else {
            const { assignee } = request;

            if( assignee ) {
                label = `${ assignee.firstname } ${ assignee.lastname }`;
            } else {
                label = "Sin asignar";
            }

            return <StatusChip label={ label } backgroundColor={ backgroundColor } />;
        }
    };

    const handleRequestEdit = ( original: Request, updates: Partial<Request> ) => {
        dispatch( updateRequest( { requests: [ original.id ], updates } ) )
        .then( r => {
            if( r.meta.requestStatus == "fulfilled" ) {
                showSnackbar( { message: "Solicitud actualizada", type: "success" } );
                loadRequests( );
                setEditModal( { opened: false, request: null } );
            }
        } );
    };

    const shouldShowColumn: ( 
        columnLabel: string, roleTitle?: string 
    ) => boolean = ( 
        columnLabel, roleTitle = loggedUser?.userRole?.title 
    ) => {
        if( !roleTitle )
            return false;

        let result = true;

        switch( columnLabel ) {
            case "Responsable":
                if( [ userRoles.shoppingAnalyst ].includes( roleTitle ) )
                    result = false;
                
                break;
        }

        return result;
    };

    const shouldEditColumn: ( 
        columnLabel: string, roleTitle?: string 
    ) => boolean = ( 
        columnLabel, roleTitle = loggedUser?.userRole?.title 
    ) => {
        if( !roleTitle )
            return false;

        let result = false;

        let roleEditableColumns: string[ ] = [ ];

        //  Only status should be editable when request is finished
        if( category == "completed" && columnLabel != "Estatus" )
            return false;

        switch( roleTitle ) {
            case userRoles.shoppingAnalyst:
                roleEditableColumns = [ "Estatus", "Nº de Solicitud/OC" ];
                result = roleEditableColumns.includes( columnLabel );
                break;

            case userRoles.shoppingChief:
                roleEditableColumns = [ ];

                switch( category ) {
                    case "progress":
                    // @ts-expect-error no-fallthrough
                    case "pending":
                        roleEditableColumns.push( "Estatus", "Nº de Solicitud/OC" )
                    case "assign":
                        roleEditableColumns.push( "Responsable" );
                        break;
                }
                
                result = roleEditableColumns.includes( columnLabel );
                break;

            case userRoles.costChief:
                roleEditableColumns = [ "Estatus" ];
                result = roleEditableColumns.includes( columnLabel );
                break;

            case userRoles.adminManagement:
                roleEditableColumns = [ "Estatus" ];
                result = roleEditableColumns.includes( columnLabel );
                break;
        }

        return result;
    };

    const ShoppingReqNumber: FC<{ request: Request; userRole?: string; }> = ( { request, userRole = loggedUser?.userRole?.title ?? "" } ) => {

        if( 
            [ userRoles.shoppingAnalyst, userRoles.shoppingChief ].includes( userRole ) && request.assignee?.id == loggedUser?.id &&
            [ "pending", "progress" ].includes( category )
        ) {
            return (
                <EditableItem 
                    value={ ( request.shoppingReqNumber ) ?? "" } 
                    onSave={ newVal => { handleRequestEdit( request, { shoppingReqNumber: newVal } ) } }
                />
            )
        } else {
            return (
                <Box><Typography sx={ textStyles } variant="body1">{ request.shoppingReqNumber ? request.shoppingReqNumber : "-" }</Typography></Box>
            );
        }
    };

    const isOldRequest = ( req: Request ) => {
        const today = dayjs( );
        const createdAt = dayjs( req.createdAt );

        return today.diff( createdAt, "days" ) > 15 && req.finishedAt === null && req.shoppingDateFinished === null;
    };

    const getShoppingElapsedTime = ( request: Request ) => {
        if( !request.shoppingDateReceived )
            return "-";

        let finalDate;

        if( request.shoppingDateFinished ) {
            finalDate = dayjs( request.shoppingDateFinished );
        } else {
            finalDate = dayjs( );
        }

        const elapsedDays = finalDate.diff( request.shoppingDateReceived, "day" );

        if( elapsedDays > 0 ) {
            return `${ elapsedDays } días`;
        } else {
            const elapsedHours = finalDate.diff( request.shoppingDateReceived, "hour" );

            if( elapsedHours > 0 ) {
                return `${ elapsedHours } horas`;
            } else {
                const elapsedMinutes = finalDate.diff( request.shoppingDateReceived, "minute" );

                if( elapsedMinutes > 0 ) {
                    return `${ elapsedMinutes } minutos`;
                } else {
                    const elapsedMinutes = finalDate.diff( request.shoppingDateReceived, "second" );

                    if( elapsedMinutes > 0 ) {
                        return `${ elapsedMinutes } segundos`;
                    } else {
                        return "Justo ahora";
                    }
                }
            }
        }
    };

    const handleReqSelection = ( req: Request | "ALL" | "CLEAR", event?: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
        if( req == "CLEAR" )
            return setSelectedRequests( [ ] );
        
        if( req == "ALL" ) {
            if( selectedRequests.length > 0 && requests.every( r => !!selectedRequests.find( req => req.id == r.id ) ) ) {
                let selection: Request[ ] = Object.assign( [ ], selectedRequests );

                selection = selection.filter( r => !requests.find( req => req.id == r.id ) );
                
                setSelectedRequests( selection );
            } else {
                const selected: Request[ ] = Object.assign( [ ], selectedRequests );
                selected.push( ...requests );

                const uniqueSelected = [ ...new Set( selected ) ];

                setSelectedRequests( uniqueSelected );
            }
        } else {
            if( selectedRequests.find( r => r.id == req.id ) ) {
                setSelectedRequests( selectedRequests.filter( r => r.id !== req.id ) );
            } else {
                setSelectedRequests( [ ...selectedRequests, req ] );
                setLastSelectedRequest( req );

                if( event?.shiftKey && lastSelectedRequest ) {
                    const lastSelectedIndex = requests.findIndex( r => r.id == lastSelectedRequest.id );
                    const currentSelectedIndex = requests.findIndex( r => r.id == req.id );

                    const start = Math.min( lastSelectedIndex, currentSelectedIndex );
                    const end = Math.max( lastSelectedIndex, currentSelectedIndex );

                    const newSelection = requests.slice( start, end + 1 );

                    setSelectedRequests( [ ...selectedRequests, ...newSelection ] );
                }
            }
        }
    }

    const tableColumns: TableColumn[ ] = [
        {
            label: "",
            format: ( request: Request ) => {
                return (
                    <Fragment>
                        <Box
                            sx={{ position: "absolute", height: "90%", width: "5px", backgroundColor: request.notes?.length ? "orange" : "transparent", top: "5%", left: 0 }}
                        ></Box>
                        <Box 
                            sx={{ 
                                display: "flex", justifyContent: "center",
                                cursor: "pointer", paddingLeft: "0.5rem"
                            }}
                            onClick={ ( event: React.MouseEvent<HTMLElement> ) => {
                                handleClickListItem( event, request );
                                setContextRequest( request );
                            } }
                        >
                            <Tooltip title="Opciones">
                                <MoreVert sx={{ color: theme.palette.asphalt }} />
                            </Tooltip>
                        </Box>        
                    </Fragment>
                );
            },
            shown: true,
            order: 0,
            width: "20px",
            freeze: true,
            zIndex: 2
        },
        {
            label: "",
            Column: ( ) => (
                <Checkbox
                    sx={{ backgroundColor: "transparent !important" }}
                    onChange={ ( ) => { handleReqSelection( "ALL" ); } }
                    checked={ selectedRequests.length > 0 && requests.every( r => !!selectedRequests.find( req => req.id == r.id ) ) }
                    indeterminate={ selectedRequests.length > 0 && ( !requests.every( r => !!selectedRequests.find( req => req.id == r.id ) ) && requests.some( r => !!selectedRequests.find( req => req.id == r.id ) ) ) }
                />
            ),
            format: ( req: Request ) => (
                <Checkbox
                    sx={{ backgroundColor: "transparent !important" }}
                    onClick={ ev => { 
                        ev.stopPropagation( ); 
                        handleReqSelection( req, ev );
                    } }
                    checked={ !!selectedRequests.find( r => r.id == req.id ) }
                />
            ),
            shown: true,
            order: 1,
            width: "42px",
            freeze: true
        },
        { 
            label: "Prioridad", 
            format: ( req: Request ) => (
                <Stack direction="row" gap="0.25rem">
                    <Tooltip title="Pedido retrasado">
                        <Warning sx={{ color: isOldRequest( req ) ? theme.palette.llansaRed : theme.palette.grayBg }} />
                    </Tooltip>
                    <Tooltip title="Pedido urgente">
                        <Timer sx={{ color: req.isUrgent ? theme.palette.llansaRed : theme.palette.grayBg }} />
                    </Tooltip>
                </Stack> 
            ),
            shown: true,
            order: 2,
            Menu: ( ) => (
                <UrgentMenu 
                    isUrgent={ filters.isUrgent }
                    isOld={ filters.isOld }
                    handleChange={ handlePriorityFilter }
                />
            ),
            width: "100px",
            freeze: true
        },
        { 
            label: "Nº de Pedido", 
            format: ( request ) => (
                <Box><Typography fontWeight="500" variant="body2" sx={{ ...textStyles }}>{ request.reqNumber }</Typography></Box>
            ), 
            width: "130px",
            shown: shouldShowColumn( "Nº de Pedido" ),
            order: 3,
            Menu: ( ) => (
                <ReqNumberMenu 
                    reqNumber={ filters.reqNumber }
                    handleChange={ handleReqNumberFilter }
                />
            ),
            freeze: true
        },
        { 
            label: "Descripción", 
            format: ( request ) => (
                <Box><Typography variant="body2" sx={{ ...textStyles }}>{ request?.item?.title }</Typography></Box>
            ), 
            width: "200px",
            shown: shouldShowColumn( "Descripción" ),
            order: 4,
            Menu: ( ) => (
                <DescriptionMenu
                    item={ filters.item }
                    handleChange={ handleItemFilter }
                />
            ),
            freeze: true
        },
        { 
            label: "Proyecto/Actividad", 
            format: ( request ) => (
                <Box sx={{ overflow: "hidden" }}>
                    <Typography variant="body3" sx={{ ...textStyles, textWrap: "nowrap", textOverflow: "hidden", overflow: "hidden" }}>{ request.project?.title }</Typography>
                    <Divider orientation="horizontal" />
                    <Typography variant="body2" sx={{ ...textStyles }}>{ request.activity?.title }</Typography>
                </Box> 
            ), 
            width: "200px",
            shown: shouldShowColumn( "Proyecto/Actividad" ),
            order: 5,
            Menu: ( ) => (
                <ProjectActivityMenu
                    project={ filters.project }
                    activity={ filters.activity }
                    handleChange={ handleProjectActivityFilter }
                />
            )
        },
        { 
            label: "Cantidad/UM", 
            format: ( request ) => (
                <Box>
                    <Stack direction="column" alignItems="center">
                        <Typography variant="body2" sx={{ ...textStyles }}>{ request.quantity }</Typography>
                        <Typography variant="body2" sx={{ ...textStyles }}>{ request.measureUnit.title }</Typography>
                    </Stack>
                </Box>
            ), 
            width: "80px",
            shown: shouldShowColumn( "Cantidad/UM" ),
            order: 6
        },
        { 
            label: "Estatus", 
            format: ( request ) => getStatusChip( request ), 
            width: "250px",
            shown: shouldShowColumn( "Estatus" ),
            order: 7,
            Menu: ( ) => (
                <StatusMenu 
                    status={ filters.status }
                    statusOptions={  statusOptions }
                    handleChange={ handleStatusFilter }
                    category={ category }
                />
            ),
            isEditable: shouldEditColumn( "Estatus" )
        },
        { 
            label: "Nº de Solicitud/OC", 
            format: ( request ) => <ShoppingReqNumber request={ request } />, 
            width: "200px",
            shown: shouldShowColumn( "Nº de Solicitud/OC" ),
            order: 8,
            Menu: ( ) => (
                <ShoppingReqNumberMenu 
                    shopReqNumber={ filters.shoppingReqNumber }
                    handleChange={ handleShopReqNumberFilter }
                />
            ),
            isEditable: shouldEditColumn( "Nº de Solicitud/OC" )
        },
        { 
            label: "Responsable", 
            format: ( request ) => getAssigneeChip( request ), 
            width: "220px",
            shown: shouldShowColumn( "Responsable" ),
            order: 9,
            Menu: ( ) => (
                <ShoppingAssigneeMenu
                    assignee={ filters.assignee }
                    handleChange={ handleShopAssigneeFilter }
                />
            ),
            isEditable: shouldEditColumn( "Responsable" )
        },
        { 
            label: "Fecha de Pedido", 
            format: ( req: Request ) => (
                <Box sx={ textStyles }>
                    <Typography variant="body2" sx={{ ...textStyles }}>{ dayjs( req.createdAt ).format( "DD/MM/YYYY" ).toString( ) }</Typography>
                    <Typography variant="body3" sx={{ ...textStyles }}>{ dayjs( req.createdAt ).format( "hh:mm a" ).toString( ) }</Typography>
                </Box>
            ),
            width: "148px",
            shown: shouldShowColumn( "Fecha de Pedido" ),
            order: 10,
            Menu: ( ) => (
                <RequestDateMenu
                    timeSpan={ { from: filters.requestDateFrom, to: filters.requestDateTo } }
                    handleChange={ handleRequestDateFilter }
                />
            )
        },
        { 
            label: "Recibido en Compras", 
            format: ( request ) => (
                <Box sx={ textStyles }>
                    {
                        request.shoppingDateReceived ? (
                            <Fragment>
                                <Typography variant="body2" sx={{ ...textStyles }}>{ dayjs( request.shoppingDateReceived ).format( "DD/MM/YYYY" ).toString( ) }</Typography>
                                <Typography variant="body3" sx={{ ...textStyles }}>{ dayjs( request.shoppingDateReceived ).format( "hh:mm a" ).toString( ) }</Typography>
                            </Fragment>
                        ) : <Typography variant="body1">-</Typography>
                    }
                </Box>
            ), 
            width: "160px",
            shown: shouldShowColumn( "Recibido en Compras" ),
            order: 11
        },
        {
            label: "Tiempo en Compras",
            tooltip: "Es el tiempo transcurrido desde que el pedido es marcado como \"Revisado\" por Costos hasta que es marcado como \"En espera de transporte\" o \"Entregado en bodega central\" por Compras",
            format: ( request ) => (
                <Box sx={ textStyles }>
                    <Typography variant="body1">
                        { getShoppingElapsedTime( request ) }
                    </Typography>
                </Box>
            ),
            width: "150px",
            shown: shouldShowColumn( "Tiempo en Compras" ),
            order: 12
        },
        { 
            label: "Finalizado en Compras", 
            format: ( request ) => (
                <Box sx={ textStyles }>
                    {
                        request.shoppingDateFinished ? (
                            <Fragment>
                                <Typography variant="body2" sx={{ ...textStyles }}>{ dayjs( request.shoppingDateFinished ).format( "DD/MM/YYYY" ).toString( ) }</Typography>
                                <Typography variant="body3" sx={{ ...textStyles }}>{ dayjs( request.shoppingDateFinished ).format( "hh:mm a" ).toString( ) }</Typography>
                            </Fragment>
                        ) : <Typography variant="body1">-</Typography>
                    }
                </Box>
            ), 
            width: "170px",
            shown: shouldShowColumn( "Finalizado en Compras" ),
            order: 13
        },
        { 
            label: "Fecha Finalizado", 
            format: ( request ) => (
                <Box sx={ textStyles }>
                    {
                        request.finishedAt ? (
                            <Fragment>
                                <Typography sx={{ ...textStyles }}>{ dayjs( request.finishedAt ).format( "DD/MM/YYYY" ).toString( ) }</Typography>
                            </Fragment>
                        ) : <Typography variant="body1">-</Typography>
                    }
                </Box>
            ), 
            width: "170px",
            shown: shouldShowColumn( "Fecha Finalizado" ),
            order: 14
        }
    ];

    const shouldBulkEdit: ( ) => boolean = ( ) => {
        const userRole = loggedUser?.userRole?.title;

        if( !userRole )
            return false;

        switch( userRole ) {
            case userRoles.costChief:
                return selectedRequests.every( s => s.shoppingStatus == null );

            case userRoles.shoppingAnalyst:
                return true;

            case userRoles.shoppingChief:
                return selectedRequests.every( s => s.assignee?.id == loggedUser?.id );

            default:
                return false;
        }
    };

    const showBulkEdit = shouldBulkEdit( );

    const SelectionTools: FC<{ open: boolean; selection: Request[ ], category: RequestCategory }> = ( { open, selection, category } ) => {
        const getItemsAmountSum = ( ) => {
            if( !selection.length )
                return 0;

            return selection?.map( r => r?.quantity )?.reduce( ( pv, cv ) => pv + cv );
        };

        const handleCopyToClipboard = ( ) => {
            let clipboardContent = selection.map( r => `- ${ r.quantity } ${ r.measureUnit.title } ${ r.item?.title }` ).join( "\n" );

            clipboardContent = clipboardContent.toUpperCase( );

            navigator.clipboard.writeText( clipboardContent )
            .then( ( ) => {
                showSnackbar( { message: "Copiado al portapapeles", type: "success" } );
                setSelectedRequests( [ ] );
            } );
        };
        
        const handleBulkEdit = ( ) => {
            setShowBulkEditModal( true );
        };

        const handleMarkAsCompleted = ( ) => {
            if( !selectedRequests.length )
                return;

            const ids = selectedRequests.map( r => r.id );

            dispatch( markRequestsAsCompleted( { requestIds: ids } ) )
            .then( ( ) => {
                showSnackbar( { message: "Marcado como completado", type: "success" } );
                setSelectedRequests( [ ] );
                loadRequests( );
            } )
            .catch( ( ) => {
                showSnackbar( { message: "Ocurrió un error", type: "error" } );
            } );
        };
        
        return (
            <Box
                sx={{ 
                    position: "fixed", bottom: `${ open ? 2 : -10 }rem`, width: "fit-content", left: "50%", marginLeft: "-130px",
                    transition: "bottom 0.5s", zIndex: 2, display: "flex"
                }}
            >
                <Stack direction="row" alignItems="center" gap="1rem" sx={{ margin: "auto" }}>
                    <Paper
                        sx={{
                            width: "fit-content",
                            borderRadius: "20px", padding: "0",
                            cursor: "pointer"
                        }}
                        elevation={6}
                    >
                        <Box
                            onClick={ ( ) => { handleReqSelection( "CLEAR" ); } }
                        >
                            <Stack direction="column">
                                <Stack direction="row" alignItems="center">
                                    <Tooltip title="Deshacer selección">
                                        <IconButton
                                            size="small" 
                                            sx={{ outline: "none !important", padding: "1rem" }}
                                        ><Close /></IconButton>
                                    </Tooltip>
                                </Stack>
                            </Stack>
                        </Box>
                    </Paper>
                    <Paper
                        sx={{
                            width: "fit-content",
                            padding: "1rem", borderRadius: "20px"
                        }}
                        elevation={6}
                    >
                        <Stack direction="column">
                            <Stack direction="row" alignItems="center">
                                <Box>Items: { selection.length }</Box>
                                <Divider orientation="vertical" sx={{ border: `solid 1px ${ theme.palette.asphalt }`, height: "1rem", margin: "auto 1rem", opacity: "0.5" }} />
                                <Box>Suma: { getItemsAmountSum( ) }</Box>
                            </Stack>
                        </Stack>
                    </Paper>
                    {
                        [ userRoles.shoppingAnalyst, userRoles.shoppingChief ].includes( loggedUser?.userRole?.title ?? "" ) && 
                        selectedRequests.every( sr => !!sr.shoppingStatus && sr.assignee?.id == loggedUser?.id ) && 
                        [ "pending", "progress" ].includes( category ) && (
                            <Paper
                                sx={{
                                    width: "fit-content",
                                    borderRadius: "20px", padding: "0",
                                    cursor: "pointer"
                                }}
                                elevation={6}
                            >
                                <Box
                                    onClick={ ( ) => { handleMarkAsCompleted( ); } }
                                >
                                    <Stack direction="column">
                                        <Stack direction="row" alignItems="center">
                                            <Tooltip title="Marcar como finalizado">
                                                <IconButton
                                                    size="small" 
                                                    sx={{ outline: "none !important", padding: "1rem" }}
                                                ><Check /></IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                </Box>
                            </Paper>
                        )
                    }
                    {
                        showBulkEdit && (
                            <Paper
                                sx={{
                                    width: "fit-content",
                                    borderRadius: "20px", padding: "0",
                                    cursor: "pointer"
                                }}
                                elevation={6}
                            >        
                                <Box
                                    onClick={ ( ) => { handleBulkEdit( ); } }
                                >
                                    <Stack direction="column">
                                        <Stack direction="row" alignItems="center">
                                            <Tooltip title="Modificar selección">
                                                <IconButton
                                                    size="small" 
                                                    sx={{ outline: "none !important", padding: "1rem" }}
                                                ><Edit /></IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                </Box>
                            </Paper>
                        )
                    }
                    <Paper
                        sx={{
                            width: "fit-content",
                            borderRadius: "20px", padding: "0",
                            cursor: "pointer"
                        }}
                        elevation={6}
                    >
                        <Box
                            onClick={ ( ) => { handleCopyToClipboard( ); } }
                        >
                            <Stack direction="column">
                                <Stack direction="row" alignItems="center">
                                    <Tooltip title="Copiar selección">
                                        <IconButton
                                            size="small" 
                                            sx={{ outline: "none !important", padding: "1rem" }}
                                        ><ContentPaste /></IconButton>
                                    </Tooltip>
                                </Stack>
                            </Stack>
                        </Box>
                    </Paper>
                </Stack>
            </Box>
        );
    };

    const getLeftNumber = ( column: TableColumn ) => {
        if( column.order === 0 )
            return "0px";
        
        const regExp = /\d+/;
        let pixels = 0;

        for( const tc of tableColumns.filter( tc => tc.freeze && tc.order < column.order ) ) {
            pixels += parseInt( tc.width.match( regExp )?.[ 0 ] ?? "0" );
            pixels += 8;
        }

        return `${ pixels }px`;
    };

    const areFiltersActive = ( ) => {
        let activeFilters = false;
        
        const applicableFilters = {
            isUrgent: filters.isUrgent,
            isOld: filters.isOld,
            project: filters.project,
            activity: filters.activity,
            status: filters.status,
            assignee: filters.assignee
        };

        const stringFilters = {
            reqNumber: filters.reqNumber,
            item: filters.item,
            shoppingReqNumber: filters.shoppingReqNumber
        }

        activeFilters = Object.values( applicableFilters ).some( f => f !== null );

        if( activeFilters )
            return true;
        
        activeFilters = Object.values( stringFilters ).some( f => f !== "" );

        if( activeFilters )
            return true;

        return activeFilters;
    }

    const handleBulkEdit: ( data: { shoppingReqNumber?: string; status?: string; additionalData?: { whReceivedDate?: Date; }; } ) => void = ( { shoppingReqNumber, status, additionalData } ) => {
        dispatch( updateRequest( { requests: selectedRequests.map( r => r.id ), updates: { shoppingReqNumber, status }, additionalData } ) )
        .unwrap( ).then( updatedRequests => {
            if( !updatedRequests ) {
                showSnackbar( { message: "No se pudieron actualizar los pedidos", type: "error" } );
                return;
            }
            
            const newRequests = Object.assign( [ ], requests ) as Request[ ];

            const matchingRequests = Object.assign( [ ], newRequests.filter( e => updatedRequests.map( ur => ur.id ).includes( e.id ) ) ) as Request[ ];

            //  Replace request in array
            matchingRequests.forEach( ( matchingRequest ) => {
                const matchingRequestIx = newRequests.findIndex( e => matchingRequest.id == e.id );

                const updatedRequest = updatedRequests.find( e => matchingRequest.id == e.id );
                
                if( updatedRequest )
                    newRequests.splice( matchingRequestIx, 1, updatedRequest );
            } );

            setRequests( newRequests );
            showSnackbar( { message: "Actualizado con éxito", type: "success" } );

            setSelectedRequests( [ ] );
            loadRequests( );
        } )
        .catch( e => {
            const { message } = e;
            
            if( message )
                showSnackbar( { message, type: "error", duration: 2000 } );
        } );
    };

    const handleQuickSearch = ( params: { reqNumber: string; } ) => {
        handleReqNumberFilter( params.reqNumber );
    };

    const PlaceholderRows = Array.from( Array( 20 ).keys() ).map( e => (
        <TableRow key={ e } sx={{ display: "relative", alignItems: "center", borderBottom: "solid 1px #E4E7EF", boxSizing: "border-box", gap: "1rem" }}>
            {
                tableColumns.filter( c => c.shown ).sort( ( a, b ) => a.order - b.order ).map( ( c, ix ) => (
                    <TableCell key={ ix } sx={{ borderBottom: "none", fontWeight: "500", paddingTop: "0", padding: "0.5rem 0.5rem 0.5rem 0", width: c.width, position: `${ c.freeze ? "sticky" : "inherit" }`, left: getLeftNumber( c ), backgroundColor: theme.palette.pureWhite, zIndex: 2 }}>
                        <Skeleton variant="rectangular" height="32px" />
                    </TableCell>
                ) )
            }
        </TableRow>
    ) );

    const PlaceholderCards = Array.from( Array( 10 ).keys() ).map( e => <CardSkeleton key={ e } /> );

    const HeaderRow = (
        <TableRow 
            sx={{ 
                display: "relative", alignItems: "center", borderBottom: "solid 1px #E4E7EF", boxSizing: "border-box", 
                gap: "1rem", position: "sticky", top: 0, backgroundColor: theme.palette.pureWhite, zIndex: 3, 
                boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.75)"
            }}
        >
            {
                tableColumns.filter( c => c.shown ).sort( ( a, b ) => a.order - b.order ).map( ( c, ix ) => (
                    <TableCell key={ ix } sx={{ borderBottom: "none", fontWeight: "500", paddingTop: "0", padding: "0.5rem 0.5rem 0.5rem 0", width: c.width, position: `${ c.freeze ? "sticky" : "inherit" }`, left: `${ c.freeze ? getLeftNumber( c ) : 0 }`, zIndex: ( c.freeze ? ( 3 + tableColumns.length - ix ) : ( 1 + tableColumns.length - ix ) ), backgroundColor: theme.palette.pureWhite }}>
                        {
                            c.Column ? (
                                c.Column( )
                            ) : (
                                <Stack direction="column">
                                    <Stack direction="row" alignItems="center" gap="0.25rem" sx={{ padding: "0 0.5rem 0 0.5rem", position: "relative" }}>
                                        <Tooltip 
                                            title={ c.tooltip ?? "" } 
                                            placement="bottom" 
                                            arrow
                                        >
                                            <Typography variant="body2" fontWeight={"500"} sx={{ cursor: "default" }}>{ c.label }</Typography>
                                        </Tooltip>
                                        <Box sx={{ position: "relative" }}>
                                            { c.Menu ? c.Menu( ) : null }
                                        </Box>
                                    </Stack>
                                    {
                                        c.isEditable && (
                                            <Box
                                                sx={{ 
                                                    position: "absolute", height: "4px", width: c.width,
                                                    backgroundColor: theme.palette.llansaRed, top: 0,
                                                    borderRadius: "0 0 8px 8px"
                                                }}
                                            ></Box>
                                        )
                                    }
                                </Stack>
                            )
                        }
                    </TableCell>
                ) )
            }
        </TableRow>
    );

    const TableRows = useMemo( ( ) => {
        if( !pageLoading ) {
            return requests.map( ( request, ix ) => {
                return (
                    <Fragment key={ ix }>
                        <TableRow 
                            sx={{ 
                                display: "relative", 
                                alignItems: "center", 
                                cursor: "default", gap: "1rem", borderBottom: `solid 1px ${ theme.palette.grayBg }`
                            }}
                            className="item-summary" 
                            //onClick={( ) => handleRowClick ? clickHandler( row ) : null }
                        >
                            {
                                tableColumns.filter( c => c.shown === true ).sort( ( a, b ) => a.order - b.order ).map( ( c, i ) => {
                                    return (
                                        <TableCell key={ i } sx={{ padding: `${ ix == 0 ? "1rem" : "0.5rem" } 0.5rem 0.5rem 0`, width: c.width, backgroundColor: ix % 2 == 0 ? theme.palette.pureWhite : "#f5f5f5", position: `${ c.freeze ? "sticky" : "inherit" }`, left: getLeftNumber( c ),  zIndex: c.zIndex ?? 2 }}>{ c.format( request, ix ) }</TableCell>
                                    );
                                } )
                            }
                        </TableRow>
                    </Fragment>
                );
            } )
        } else {
            return null;
        }
    }, [ requests, selectedRequests, pageLoading ] );

    const ContextualMenu: FC = ( ) => { 
        
        if( !contextRequest || !userRole )
            return null;

        const canEdit = RequestUtils.canBeEdited( { request: contextRequest, userRole } );

        const canDelete = RequestUtils.canBeDeleted( { request: contextRequest, userRole } );
        
        return (
            <Menu
                id="menu"
                anchorEl={ cxAnchorEl }
                open={ cxOpen }
                onClose={ handleClose }
            >
                <MenuItem
                    onClick={ ( ) => {
                        setOpenRequestNotesModal( { opened: true, request: contextRequest } );
                        handleMenuItemClick( ); 
                    } }
                >Ver notas</MenuItem>
                
                {
                    canEdit && (
                        <MenuItem 
                            onClick={ ( ) => { 
                                setEditModal( { opened: true, request: contextRequest } );
                                handleMenuItemClick( );
                            } }
                        >Editar</MenuItem>
                    )
                }

                {
                    canDelete && (
                        <MenuItem 
                            onClick={ ( ) => {
                                setOpenDeleteModal( { opened: true, request: contextRequest } );
                                handleMenuItemClick( );
                            } }
                        >Eliminar</MenuItem>
                    )
                }
            </Menu>
        );
    };

    const Paginator = (
        requests.length === 0 && loading ? ( 
            <Box sx={{ marginTop: "1rem" }}>
                <Skeleton variant="rectangular" height="32px" /> 
            </Box>
        ) : (
            totalRequests > 0 && pageCount > 1 && (
                <>
                    <Box sx={{ display: "flex", flexFlow: "column", alignItems: "flex-end", justifyContent: "center", marginTop: "1rem", width: "100%" }}>
                        <Divider orientation="horizontal" sx={{ width: "100%" }} />
                        <Box sx={{ display: "flex", gap: "1rem", textAlign: "center", boxSizing: "border-box", margin: "0.25rem 0 0 0" }}>
                            <Stack direction="row">
                                <Box onClick={( ) => { handleFirstPage( ); } } sx={{ cursor: filters.page > 1 ? "pointer" : "default", color: filters.page > 1 ? "inherit" : "transparent" }}><Typography><FirstPage /></Typography></Box>
                                <Box onClick={( ) => { handlePreviousPage( ); } } sx={{ cursor: filters.page > 1 ? "pointer" : "default", color: filters.page > 1 ? "inherit" : "transparent" }}><Typography><ChevronLeft /></Typography></Box>
                            </Stack>
                            <Typography>Página { filters.page } de { pageCount }</Typography>
                            <Stack direction="row">
                                <Box onClick={( ) => { handleNextPage( ); } } sx={{ cursor: "pointer",  color: filters.page < pageCount ? "inherit" : "transparent" }}><Typography><ChevronRight /></Typography></Box>
                                <Box onClick={( ) => { handleLastPage( ); } } sx={{ cursor: "pointer",  color: filters.page < pageCount ? "inherit" : "transparent" }}><Typography><LastPage /></Typography></Box>
                            </Stack>
                        </Box>
                        <Divider orientation="horizontal" sx={{ width: "100%" }} />
                    </Box>
                </>
            ) )
    );
    
    if( isMobile ) {
        const getVisibleTabs = ( ) => {
            const options = [ ];

            if( loggedUser?.userRole?.title ) {
                switch( loggedUser?.userRole?.title ) {
                    case userRoles.shoppingChief:
                        options.push( { id: "assign", label: "Asignación" } );
                        break;
                }
                
                if( ![ userRoles.its ].includes( loggedUser?.userRole?.title ) ) {
                    options.push( 
                        { id: "pending", label: "Pendiente" }, { id: "progress", label: "En progreso" }, 
                        { id: "completed", label: "Finalizado" }
                    );
    
                    if( ![ userRoles.shoppingAnalyst, userRoles.shoppingChief, userRoles.adminManagement ].includes( loggedUser?.userRole?.title ) )
                        options.unshift( { id: "review", label: "Revisión" } );
                }
            }
    
            return options;    
        };
      
        return (
            <Box>
                {
                    createPortal(
                        <MobileSearchModal
                            opened={ showMobileSearch }
                            toggler={ ( ) => setShowMobileSearch( !showMobileSearch ) }
                            handleConfirm={ ( { reqNumber, description } ) => {
                                handleReqNumberFilter( reqNumber );
                                handleItemFilter( description );
                            } }
                        />,
                        document.getElementById( "root" )!
                    )
                }
                {
                    createPortal(
                        <RequestDeleteModal />,
                        document.getElementById( "root" )!
                    )
                }
                { createPortal( 
                    <RequestCreateModal 
                        mobile={ true }
                        opened={ openCreateRequestModal } 
                        toggler={ ( ) => { setOpenCreateRequestModal( false ); } } 
                        onCreate={ loadRequests }
                    />,
                    document.getElementById( "root" )!
                ) }
                { createPortal(
                    <RequestNotesModal 
                        opened={ openRequestNotesModal.opened } toggler={ setOpenRequestNotesModal }
                        onCreate={ handleCreateRequest } request={ openRequestNotesModal.request }
                        mobile={ true }
                    />,
                    document.getElementById( "root" )!
                ) }
                <Paper
                    sx={{
                        position: "relative", top: 0, left: 0
                    }}
                >
                    <Tabs 
                        value={ getVisibleTabs( ).findIndex( v => v.id == category ) } 
                        onChange={ ( value: React.SyntheticEvent ) => {
                            const { category } = ( value.target as HTMLDivElement ).dataset;

                            if( !category )
                                return;

                            const searchParams = getSearchWithFirstPage( new URLSearchParams( search ) );
                            
                            navigate( `/orders/${ category }${ searchParams }` );
                        } } 
                        aria-label="tabs" variant="scrollable"
                        scrollButtons={ false }
                    >
                        {
                            getVisibleTabs( ).map( vt => (
                                <Tab key={ vt.id } label={ vt.label } data-category={ vt.id } />
                            ) )
                        }
                    </Tabs>
                </Paper>
                <Box>
                    <EditRequestModal
                        opened={ editModal.opened } 
                        toggler={ setEditModal } 
                        onEdit={ handleRequestEdit } 
                        request={ editModal.request } 
                        mobile={ true }
                    />
                    <Stack direction="column" gap="1rem">
                        {
                            completedFirstFetch && (
                                <MobilePaginator
                                    first={ handleFirstPage }
                                    previous={ handlePreviousPage }
                                    next={ handleNextPage }
                                    last={ handleLastPage }
                                    currentPage={ filters.page }
                                    pageCount={ pageCount }
                                />
                            )
                        }
                        {
                            ( requests.length == 0 && !loading && completedFirstFetch ) && (
                                areFiltersActive( ) ? (
                                    <Stack direction="column" width="100%" alignItems="center" margin="1rem 0">
                                        <img src={ EmptyImage } width={150} />
                                        <Typography variant="body1">No se encontraron resultados</Typography>        
                                    </Stack>    
                                ) : (
                                    <Stack direction="column" width="100%" alignItems="center" margin="1rem 0">
                                        <img src={ TasksCompletedImg } style={{ opacity: "0.75" }} width={100} />
                                        <Typography variant="body1">No hay nada acá</Typography>        
                                    </Stack>    
                                )
                            )
                        }
                        {
                            ( loading && requests.length == 0 || pageLoading ) ? (
                                PlaceholderCards
                            ) : (
                                <>
                                    {
                                        requests.map( r => (
                                            <RequestCard
                                                key={ r.id } 
                                                request={ r }
                                                handleDelete={ req => {
                                                    setOpenDeleteModal( p => ( { ...p, opened: true, request: req } ) );
                                                } }
                                                handleEdit={ req => {
                                                    setEditModal( { opened: true, request: req } );
                                                } }
                                                handleNotes={ req => { setOpenRequestNotesModal( { opened: true, request: req } ) } }
                                            /> 
                                        ) )
                                    }
                                    {
                                        pageCount > 1 && (
                                            <MobilePaginator
                                                first={ handleFirstPage }
                                                previous={ handlePreviousPage }
                                                next={ handleNextPage }
                                                last={ handleLastPage }
                                                currentPage={ filters.page }
                                                pageCount={ pageCount }
                                            />
                                        )
                                    }    
                                </>
                            )
                        }
                    </Stack>
                </Box>
                <MobileBottomNav
                    filterCallback={ ( ) => { setShowMobileSearch( true ); } }
                    addCallback={ ( ) => { setOpenCreateRequestModal( true ); } }
                    filtersActive={ areFiltersActive( ) }
                />
            </Box>
        );
    }
    
    return (
        <Box sx={{ backgroundColor: theme.palette.pureWhite, margin: "auto", marginLeft: "0.5rem" }}>
            <ContextualMenu />
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                padding={`${ loggedUser?.userRole?.title === userRoles.projectAdmin ? "8px" : "22px" } 0 ${ pageCount > 1 ? "0" : "0.5rem" } 1rem`}
            >
                <Stack direction="column">
                    <Typography variant="header2">Tabla de pedidos</Typography>
                </Stack>
                <Stack direction="column">
                    {
                        loggedUser?.userRole?.title === userRoles.projectAdmin && category === "review" && (
                            <Button disabled={ loading } variant="contained" onClick={ ( ) => { setOpenCreateRequestModal( true ); } } sx={{ marginRight: "1rem" }}>Crear Pedido</Button>
                        )
                    }
                </Stack>
            </Stack>
            <Stack direction="column" gap={ 0 }>
                { Paginator }
                <TableContainer
                    id="requests-table" 
                    sx={{ 
                        minHeight: `${ ( window.innerHeight - ( pageCount > 1 ? 172 : 132 ) ) }px`, 
                        maxHeight: `${ ( window.innerHeight - ( pageCount > 1 ? 172 : 132 ) ) }px !important`
                    }}
                >
                    <Table sx={{ tableLayout: "fixed" }}>
                        <TableBody sx={{ display: "relative", position: "inherit" }}>
                            { HeaderRow }
                            { 
                                ( loading && requests.length == 0 || pageLoading ) ? 
                                    PlaceholderRows : 
                                    TableRows 
                            }
                        </TableBody>
                    </Table>
                    {
                        requests.length == 0 && !loading && completedFirstFetch && (
                            <Box sx={{ display: "flex", flexFlow: "column", alignItems: "center", position: "sticky", left: 0, height: "100%", padding: "2rem 0" }}>
                                {
                                    ( category == "completed" || areFiltersActive( ) ) && (
                                        <Fragment>
                                            <img src={ EmptyImage } width={150} />
                                            <Typography variant="body1">No se encontraron resultados</Typography>        
                                        </Fragment>
                                    )
                                }
                                {
                                    ( [ "pending", "review", "assign" ].includes( category ) && !areFiltersActive( ) ) && (
                                        <Fragment>
                                            <img src={ TasksCompletedImg } style={{ opacity: "0.75" }} width={100} />
                                            <Typography variant="body1">No tienes nada pendiente</Typography>        
                                        </Fragment>
                                    )
                                }
                            </Box>
                        )
                    }
                </TableContainer>
            </Stack>
            <RequestCreateModal opened={ openCreateRequestModal } toggler={ setOpenCreateRequestModal } onCreate={ handleCreateRequest } />
            <RequestNotesModal opened={ openRequestNotesModal.opened } toggler={ setOpenRequestNotesModal } onCreate={ handleCreateRequest } request={ openRequestNotesModal.request } />
            <BulkEditModal opened={ showBulkEditModal } toggler={ ( ) => { setShowBulkEditModal( p => !p ); } } handleConfirm={ handleBulkEdit } />
            <QuickSearchModal opened={ showQuickSearch } toggler={ ( ) => { setShowQuickSearch( p => !p ); } } handleConfirm={ handleQuickSearch } />
            <WHReceivedDateModal 
                opened={ openWhReceivedDateModal.opened } 
                toggler={ ( ) => setOpenWhReceivedDateModal( { opened: false } ) } 
                handleConfirm={ ( receivedDate: Dayjs ) => {
                    let targetStatus = requestStatuses.shoppingStatuses.finished.id;

                    if( 
                        openWhReceivedDateModal.targetStatus && 
                        openWhReceivedDateModal.targetStatus != targetStatus
                    ) {
                        targetStatus = openWhReceivedDateModal.targetStatus;
                    }
                    
                    handleRequestUpdate( selectedRequest?.id ?? 0, String( targetStatus ), {
                        whReceivedDate: receivedDate.toDate( )
                    } );
                    setOpenWhReceivedDateModal( { opened: false } );
                } }
            />
            <RequestDeleteModal />
            <EditRequestModal
                opened={ editModal.opened } 
                toggler={ setEditModal } 
                onEdit={ handleRequestEdit } 
                request={ editModal.request } 
            />
            <Snackbar
                open={ snackbar.show }
                autoHideDuration={ snackbar.duration ?? 1000 }
                onClose={( ) => setSnackbar( { ...snackbar, show: false } )}
            >
                <Alert
                    severity={ snackbar.type }
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    { snackbar.message }
                </Alert>
            </Snackbar>
            <SelectionTools open={ !!selectedRequests.length } selection={ selectedRequests } category={ category } />
        </Box>
    );
};

export default RequestsTable;
