import { configureStore, createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import authService from "../services/Auth";
import userService from "../services/User";
import Sitemap from "../routes/Sitemap";
import { CommonState as Common } from "../interfaces/state/Common";
import { Filter } from "../interfaces/state/Filter";
import { Activity, User, Project, Request as RequestModel, Request } from "../interfaces/Models";
import projectService from "../services/Project";
import requestService from "../services/Request";
import adminService from "../services/Admin";
import catalogService from "../services/Catalog";
import { userRoles } from "../constants";
import { CatalogOption, RequestCategory } from "../interfaces/Common";
import dayjs from "dayjs";


export interface Visit { 
    date: string; time: string; location: string; name: string; lastnames: string; 
    service: string; hospital: string; goal: string; brands: string; trainedHcps: string; 
    activityDone: string; visitResult: string; id?: number; country: string;
};

const emptyFilterState: Filter = {
    activityOptions: [ ],
    statusOptions: [
        { value: "pending", label: "Pendiente" },
        { value: "finished", label: "Completado" },
    ],
    projectOptions: [ ],

    selectedActivity: null,
    selectedStatus: { value: "pending", label: "Pendiente" },
    selectedProject: null,
    searchInputValue: "",

    requestNumber: "",
    projectsFilter: [ ]
};

const emptyCommonState: Common = {
    drawerOpened: false,
    toolbarOpened: false,

    loggedUser: null,

    projects: [ ],
    roles: [ ],
    items: [ ],
    measureUnits: [ ],
    shoppingAnalysts: [ ],

    requestedPassChange: false,

    modalOpen: false,

    snackbar: {
        show: false,
        message: "",
        type: "info"
    },

    selectedRequest: null,

    isMobile: false
};

const initialFilterState = emptyFilterState;
const initialCommonState = emptyCommonState;

export const login = createAsyncThunk( "auth/login", async ( user: { username: string, password: string }, thunkAPI ) => {
    try {
        const response = await authService.login( user );

        if( response.status != 200 )
            return thunkAPI.rejectWithValue( "Internal" );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e  ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const logout = createAsyncThunk( "auth/logout", async ( _, thunkAPI ) => {
    try {
        interface Response { data: { message: string; } }

        const response = ( await authService.logout( ) ) as Response;

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    } finally {
        window.removeAppItem( "loggedUser" );
        window.removeAppItem( "token" );

        window.location.assign( Sitemap.login );
    }
} );

export const getLoggedUser = createAsyncThunk( "user/getLoggedUser", async( _, thunkAPI ) => {
    try {
        interface Response { data: User };

        const response = ( await userService.getLoggedUser( ) ) as Response;

        thunkAPI.dispatch( getLoggedUserProjects( ) );

        return response.data;
    } catch( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

const getLoggedUserProjects = createAsyncThunk( "project/getUserProjects", async( _, thunkAPI ) => {
    try {
        const response = await projectService.getLoggedUserProjects( );

        return response.data;
    } catch( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal Server Error" );
    }
} );

export const getRequests = createAsyncThunk( "request/getRequests", async( data: {
	page: number;
	filters?: { 
		reqNumber?: string; project?: number; activity?: number; 
		item?: string; status?: string; isUrgent?: number; 
		assignee?: number; shoppingReqNumber?: string; 
	};
	category: RequestCategory;
}, thunkAPI ) =>  {
    try {
        const response = await requestService.getRequests( data );

        return response.data;
    } catch( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal Server Error" );
    }
} );

export const checkRequestExists = createAsyncThunk( "request/checkRequestExists", async( data: {
	requestNumber: string;
	projectId: number;
}, thunkAPI ) =>  {
    try {
        const response = await requestService.checkRequestExists( data );

        return response.data;
    } catch( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal Server Error" );
    }
} );

export const fetchDashboardData = createAsyncThunk( "request/getDashboard", async( data: {
	filters: { startDate?: string; endDate?: string; project?: number; isUrgent?: number; }
}, thunkAPI ) =>  {
    try {
        const response = await requestService.getDashboardData( data );

        return response.data;
    } catch( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal Server Error" );
    }
} );

export const fetchRequestNotes = createAsyncThunk( "request/getRequestNotes", async( requestId: number, thunkAPI ) =>  {
    try {
        const response = await requestService.getRequestNotes( requestId );

        return response.data;
    } catch( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal Server Error" );
    }
} );

export const getUsers = createAsyncThunk( "admin/getUsers", async( data: { 
	page: number; 
	filters?: { 
		name?: string; 
		project?: number; 
		status?: number; 
	} }, thunkAPI ) => {
    try {
        const response = await adminService.getUsers( data );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const requestNoteUpdate = createAsyncThunk( "requestNote/update", async( data: { 
        noteId: number;
        newContent: string;
	}, thunkAPI ) => {
    try {
        const response = await requestService.updateRequestNote( data );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const requestNoteDelete = createAsyncThunk( "requestNote/delete", async( data: { 
        noteId: number;
	}, thunkAPI ) => {
    try {
        const response = await requestService.deleteRequestNote( data );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const createUser = createAsyncThunk( "admin/createUser", async( newUser: Pick<User, "username" | "firstname" | "lastname" | "email">&{ role: number; projects: string[ ] }, thunkAPI ) => {
    try {
        const { username, email, firstname, lastname, role } = newUser;
        
        if( !username || !email || !firstname || !lastname || !role )
            throw new Error( "All required fields must not be empty" );

        const paramUser = {
            username: newUser.username as string,
            email: newUser.email as string,
            firstname: newUser.firstname as string,
            lastname: newUser.lastname as string,
            role: newUser.role as number,
            projects: newUser.projects
        };
        
        const response = await adminService.createUser( paramUser );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const createRequest = createAsyncThunk( "requests/createRequest", async( newRequest: {
	project: CatalogOption; activity: CatalogOption; requestNumber: string;
	items: {
		item: CatalogOption;
		measureUnit: CatalogOption;
		quantity: string;
	}[ ];
	}, thunkAPI
) => {
    try {
        const response = await requestService.createRequest( newRequest );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const deleteRequest = createAsyncThunk( "requests/deleteRequest", async( requestId: number, thunkAPI ) => {
    try {
        const response = await requestService.deleteRequest( requestId );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const updateRequest = createAsyncThunk( "requests/updateRequest", async( data: { requests: number[ ], updates: Partial<Request>&{ status?: string; }, additionalData?: { whReceivedDate?: Date; } }, thunkAPI ) => {
    try {
        const { requests, updates, additionalData } = data;
        const response = await requestService.updateRequest( requests, updates, additionalData );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( { status: e.response?.status, message: e.response?.data?.userMessage } );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const markRequestsAsCompleted = createAsyncThunk( "requests/markRequestsAsCompleted", async( data: { requestIds: number[ ] }, thunkAPI ) => {
    try {
        const { requestIds } = data;
        const response = await requestService.markRequestsAsCompleted( requestIds );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const getSurveys = createAsyncThunk( "surveys/get-list", async( _, thunkAPI ) => {
    try {
        const response = await requestService.getSurveys( );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const getVisits = createAsyncThunk( "visits/get", async( _, thunkAPI ) => {
    try {
        const response = await requestService.getVisits( );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const getVisitsCSV = createAsyncThunk( "visits/get/csv", async( _, thunkAPI ) => {
    try {
        const response = await requestService.getVisitsCSV( );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const getDataQuery = createAsyncThunk( "queries/get-general-data", async( data: { name?: string; hospital?: string; submissionId?: string }, thunkAPI ) => {
    try {
        const response = await requestService.getQuery( data );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const postVisit = createAsyncThunk( "visits/post", async( data: Visit, thunkAPI ) => {
    try {
        const response = await requestService.postVisit( data );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const getReplies = createAsyncThunk( "replies/survey/get", async( data: { surveyid: number; }, thunkAPI ) => {
    try {
        const response = await requestService.getReplies( data.surveyid );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const getRepliesCSV = createAsyncThunk( "replies/survey-csv/get", async( data: { surveyid: number; }, thunkAPI ) => {
    try {
        const response = await requestService.getRepliesCSV( data.surveyid );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const postSurvey = createAsyncThunk( "surveys/submit", async( data: { data: object, surveyid: number }, thunkAPI ) => {
    try {
        const response = await requestService.postSurvey( data );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

export const updateRequestCostStatus = createAsyncThunk( "requests/updateCostStatus", async( data: { id: number; status: string; }, thunkAPI ) => {
    try {
        const response = await requestService.updateCostStatus( data );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const updateUser = createAsyncThunk( "admin/updateUser", async( data: Partial<{
	id: number; username: string; firstname: string; lastname: string;
	email: string; role: number | null | string; projects: string[ ]; isActive: boolean;
}>, thunkAPI ) => {
    try {
        const response = await adminService.updateUser( data );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const postRequestNote = createAsyncThunk( "requests/postNote", async( data: { requestId: number; noteContent: string; }, thunkAPI ) => {
    try {
        const response = await requestService.postRequestNote( data );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const updateRequestAdmonMgmtStatus = createAsyncThunk( "requests/updateAdmonMgmtStatus", async( data: { id: number; status: string; }, thunkAPI ) => {
    try {
        const response = await requestService.updateAdmonMgmtStatus( data );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const updateRequestShoppingStatus = createAsyncThunk( "requests/updateShoppingStatus", async( data: { requestId: number; status: string; additionalData?: { whReceivedDate?: Date } }, thunkAPI ) => {
    try {
        const response = await requestService.updateShoppingStatus( data );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const fetchAllProjectOptions = createAsyncThunk( "catalog/fetchAllProjects", async( _, thunkAPI ) => {
    try {
        const response = await catalogService.getAllProjects( );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const getShoppingAnalistOptions = createAsyncThunk( "catalog/fetchAllShoppingAnalists", async( _, thunkAPI ) => {
    try {
        const response = await catalogService.getAllShoppingAnalists( );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const shoppingAssignRequest = createAsyncThunk( "requests/shoppingAssignRequest", async( data: { userId: number | null; requestId: number; }, thunkAPI ) => {
    try {
        const response = await requestService.shoppingAssignRequest( data );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const fetchAllItemsOptions = createAsyncThunk( "catalog/fetchAllItems", async( _, thunkAPI ) => {
    try {
        const response = await catalogService.getAllItems( );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const fetchAllMeasureUnits = createAsyncThunk( "catalog/fetchAllMeasureUnits", async( _, thunkAPI ) => {
    try {
        const response = await catalogService.getAllMeasureUnits( );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const fetchAllRoleOptions = createAsyncThunk( "catalog/fetchAllRoles", async( _, thunkAPI ) => {
    try {
        const response = await catalogService.getAllRoles( );

        return response.data;
    } catch ( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );        
    }
} );

export const requestPasswordChange = createAsyncThunk( "auth/requestPassChange", async( data: { username: string }, thunkAPI ) => {
    try {
        const response = await authService.requestUserPassChange( data );

        if( !response )
            throw new Error( "Could not request pass change" );

        return response.data;
    } catch( e ) {
        if( axios.isAxiosError( e ) ) {
            return thunkAPI.rejectWithValue( e.response?.status );
        }

        return thunkAPI.rejectWithValue( "Internal server error" );
    }
} );

const filterSlice = createSlice( {
    name: "filter",
    initialState: initialFilterState,
    reducers: {
        setActivityOptions: ( state, action: PayloadAction<Activity[]> ) => {
            state.activityOptions = action.payload;
        },
        setProjectOptions: ( state, action: PayloadAction<Project[]> ) => {
            state.projectOptions = action.payload;
        },
        setStatusOptions: ( state, action: PayloadAction<{ label: string; value: string; }[]> ) => {
            state.statusOptions = action.payload;
        },
        setSelectedActivity: ( state, action: PayloadAction<Activity | null> ) => {
            state.selectedActivity = action.payload;
        },
        setSelectedProject: ( state, action: PayloadAction<Project | null> ) => {
            state.selectedProject = action.payload;
        },
        setSelectedStatus: ( state, action: PayloadAction<{ label: string; value: string; } | null> ) => {
            state.selectedStatus = action.payload;
        },
        setFilters: ( state, action: PayloadAction<Partial<Filter>> ) => {
            if( action.payload.projectsFilter )
                state.projectsFilter = action.payload.projectsFilter;
        }
    }
} );

const commonSlice = createSlice( {
    name: "common",
    initialState: initialCommonState,
    reducers: {
        clearState: ( ) => emptyCommonState,
        setDrawerStatus: ( state, action: PayloadAction<boolean> ) => {
            state.drawerOpened = action.payload;
        },
        setToolbarOpened: ( state, action: PayloadAction<boolean> ) => {
            state.toolbarOpened = action.payload;
        },
        loadUserFromStorage: ( state ) => {
            const parsedUser = JSON.parse( window.getAppItem( "loggedUser" ) ?? "" ) as User;

            state.loggedUser = parsedUser;

        },
        setRequestedPassChange: ( state, action: PayloadAction<boolean> ) => {
            state.requestedPassChange = action.payload;
        },
        setModalOpen: ( state, action: PayloadAction<{ status: boolean; component?: "newRequest"; }> ) => {
            state.modalOpen = action.payload.status;
            state.modalComponent = action.payload.component;
        },
        toggleSnackbar: ( state, action: PayloadAction<{ message?: string; type?: "info" | "success" | "error" | "warning" }> ) => {
            state.snackbar.show = !!action.payload.message;
            state.snackbar.message = action.payload.message ?? "";
            state.snackbar.type = action.payload.type ?? "info"
        },
        setSelectedRequest: ( state, action: PayloadAction<RequestModel|null> ) => {
            state.selectedRequest = action.payload;
        },
        setIsMobile: ( state, action: PayloadAction<boolean> ) => {
            state.isMobile = action.payload;
        }
    },
    extraReducers: builder => {
        builder
        .addCase( login.fulfilled, ( state, action ) => {
            if( action.payload ) {
                const isMobile = window.mobileCheck( );
                
                state.loggedUser = action.payload;
                localStorage.setItem( "loggedUser", JSON.stringify( action.payload ) );
                localStorage.setItem( "token", action.payload?.token );

                //  Redirect based on role
                window.location.assign( "/surveys" );    //  Redirect to requests page
            }
        } )
        .addCase( getLoggedUser.fulfilled, ( state, action ) => {
            if( action.payload ) {
                state.loggedUser = action.payload;
                localStorage.setItem( "loggedUser", JSON.stringify( action.payload ) );
            }
        } )
        .addCase( getLoggedUserProjects.fulfilled, ( state, action ) => {
            state.loggedUser = { 
                ...state.loggedUser!,
                projects: action.payload
            }
        } )
        .addCase( requestPasswordChange.fulfilled, ( state ) => {
            state.requestedPassChange = true;
        } )
        .addCase( getRepliesCSV.fulfilled, ( _, action ) => {
            if( action.payload ) {
                const url = window.URL.createObjectURL( new Blob( [ action.payload ] ) );

                const link = document.createElement( "a" );
                link.href = url;
                link.setAttribute( "download", "data.csv" );
                document.body.appendChild( link );
                link.click( );
                link.remove( );
            }
        } )
        .addCase( getVisitsCSV.fulfilled, ( _, action ) => {
            if( action.payload ) {
                const url = window.URL.createObjectURL( new Blob( [ action.payload ] ) );

                const link = document.createElement( "a" );
                link.href = url;
                link.setAttribute( "download", `visits_${ dayjs( ).format( "DDMMYYYY_hhmmss" ) }.csv` );
                document.body.appendChild( link );
                link.click( );
                link.remove( );
            }
        } )
        .addCase( fetchAllProjectOptions.fulfilled, ( state, action ) => {
            state.projects = action.payload;
        } )
        .addCase( getShoppingAnalistOptions.fulfilled, ( state, action ) => {
            state.shoppingAnalysts = action.payload;
        } )
        .addCase( fetchAllRoleOptions.fulfilled, ( state, action ) => {
            state.roles = action.payload;
        } )
        .addCase( fetchAllItemsOptions.fulfilled, ( state, action ) => {
            state.items = action.payload;
        } )
        .addCase( fetchAllMeasureUnits.fulfilled, ( state, action ) => {
            state.measureUnits = action.payload;
        } )
    }
} );

const store = configureStore( {
    reducer: {
        common: commonSlice.reducer,
        filter: filterSlice.reducer
    }
} );

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;

export const { 
    setActivityOptions, setSelectedActivity, setSelectedProject, setSelectedStatus, 
    setToolbarOpened, setRequestedPassChange, setModalOpen, toggleSnackbar,
    setSelectedRequest, setIsMobile
} = { 
    ...commonSlice.actions, ...filterSlice.actions 
};

export default store;
