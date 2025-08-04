import { CatalogOption, RequestCategory } from "../interfaces/Common";
import http from "./Http";
import { Request, RequestNote } from "../interfaces/Models";

export interface DashboardPayload {
    requestCount: number;
    inProgressCount: number;
    pendingRequests: Request[ ];
    finishedRequests: Request[ ];
    finishedRequestCount: number;
};

function buildQueryParams( params: object ) {
    // Ensure params is an object
    if ( typeof params !== 'object' || params === null ) {
	  throw new Error( 'Params must be a non-null object' );
    }
  
    // Iterate over the object and construct key-value pairs
    return Object.entries( params )
	  .filter( ( [ , value ] ) => value !== undefined && value !== null && value !== "" ) // Exclude undefined or null values
	  .map( ( [ key, value ] ) => {
        if ( Array.isArray( value ) ) {
		  // Handle arrays by creating multiple entries for the same key
		  return value.map( item => `${encodeURIComponent( key )}=${encodeURIComponent( item )}` );
        } else {
		  // Handle single values
		  return `${encodeURIComponent( key )}=${encodeURIComponent( value )}`;
        }
	  } )
	  .flat(); // Flatten the array to ensure a single-level array
}

class RequestService {
    async getRequests( data: {
		page: number; filters?: { reqNumber?: string; project?: number; activity?: number; item?: string; status?: string; isUrgent?: number; assignee?: number; shoppingReqNumber?: string; }; category: RequestCategory;
	} ) {
        const { page, filters = { }, category } = data;
        const reqFilters = buildQueryParams( { page, ...filters, category } ).join( "&" );

        const response = await http.get<{
			data: Request[ ];
			total: number; pages: number;
		}>( `/api/v1/request/getRequests?${ reqFilters }` );

        return response;
    }

    async getRequestNotes( requestId: number ) {

        const response = await http.get<RequestNote[ ]>( `/api/v1/request/getRequestNotes?requestId=${ requestId }` );

        return response;
    }

    async getSurveys( ) {
        const response = await http.get( "/api/v1/survey" );

        return response;
    }

    async getReplies( surveyid: number ) {
        const response = await http.get( `/api/v1/replies?surveyid=${ surveyid }` );

        return response;
    }

    async getRepliesCSV( surveyid: number ) {
        const response = await http.get( `/api/v1/replies-csv?surveyid=${ surveyid }` );

        return response;
    }

    async createRequest( request: {
		project: CatalogOption; activity: CatalogOption; requestNumber: string;
		items: {
			item: CatalogOption;
			measureUnit: CatalogOption;
			quantity: string;
		}[ ];
	} ) {
        const response = await http.post<Request>( "/api/v1/request/createRequest", request );

        return response;
    }

    async updateCostStatus( data: { id: number; status: string; } ) {
        const response = await http.patch<Request>( "/api/v1/request/updateCostStatus", data );

        return response;
    }

    async updateAdmonMgmtStatus( data: { id: number; status: string; } ) {
        const response = await http.patch<Request>( "/api/v1/request/updateAdmonMgmtStatus", data );

        return response;
    }

    async updateShoppingStatus( data: { requestId: number; status: string; additionalData?: { whReceivedDate?: Date; } } ) {
        const response = await http.patch<Request>( "/api/v1/request/updateShoppingStatus", data );

        return response;
    }

    async shoppingAssignRequest( data: { requestId: number; userId: number | null; } ) {
        const response = await http.patch<Request>( "/api/v1/request/shoppingAssignRequest", data );

        return response;
    }

    async postRequestNote( data: { requestId: number; noteContent: string; } ) {
        const response = await http.post( "/api/v1/request/createNote", data );
		
        return response;
    }

    async postSurvey( data: { data: object; surveyid: number; } ) {
        const response = await http.post( "/api/v1/survey", data );
		
        return response;
    }

    async deleteRequest( requestId: number ) {
        const response = await http.patch( "/api/v1/request/deleteRequest", { requestId } );

        return response;
    }
	
    async updateRequest( requests: number[ ], updates: Partial<Request>, additionalData?: { whReceivedDate?: Date; } ) {
        const response = await http.patch<Request[ ]>( "/api/v1/request/updateRequest", { 
            requests, ...updates, additionalData
        } );

        return response;
    }

    async markRequestsAsCompleted( requestIds: number[ ] ) {
        const response = await http.post<Request[ ]>( "/api/v1/request/markAsCompleted", { 
            requestIds
        } );

        return response;
    }

    async getDashboardData( data: { filters: { startDate?: string; endDate?: string; project?: number; isUrgent?: number; } } ) {
        const { filters = { } } = data;
        const reqFilters = buildQueryParams( { ...filters } ).join( "&" );

        const response = await http.get<DashboardPayload>( `/api/v1/request/getDashboard?${ reqFilters }` );

        return response;
    }

    async checkRequestExists( data: { requestNumber: string; projectId: number; } ) {
        const reqFilters = buildQueryParams( { ...data } ).join( "&" );

        const response = await http.get<{
			userMessage: string;
            body: { requestExists: boolean; }
		}>( `/api/v1/request/exists?${ reqFilters }` );

        return response;
    }

    async updateRequestNote( data: { noteId: number; newContent: string; } ) {
        const response = await http.patch<RequestNote>( "/api/v1/request/updateNote", {
            id: data.noteId,
            content: data.newContent
        } );

        return response;
    }

    async deleteRequestNote( data: { noteId: number; } ) {
        const response = await http.patch<void>( "/api/v1/request/deleteNote", {
            id: data.noteId
        } );

        return response;
    }

}

const requestService = new RequestService( );
export default requestService;
