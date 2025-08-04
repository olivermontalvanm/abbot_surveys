import http from "./Http";

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

class AdminService {
    async getUsers( data: { page: number; filters?: { name?: string; project?: number; status?: number; } } ) {
        const { page, filters = { } } = data;
        const reqFilters = buildQueryParams( { page, ...filters } ).join( "&" );
        const response = await http.get<{ 
			total: number; 
			data: {
				canResetPassword: boolean; createdAt: string; email: string;
				firstname: string; forgotPassword: string;
				id: number; isActive: boolean; lastname: string; password: string;
				projects: { id: number; title: string; description: string | null; createdAt: string; updatedAt: string; }[ ],
				roleId: number; updatedAt: string; userRole: { id: number; title: string; }, username: string;
			}[ ],
			pages: number;
		}>( `/api/v1/admin/getUsers?${ reqFilters }` );

        return response;
    }

    async createUser( newUser: {
		username: string; email: string; firstname: string; lastname: string;
		role: number; projects: string[ ];
	} ) {
        const response = await http.post( "/api/v1/admin/createUser", newUser );

        return response;
    }

    async updateUser( user: Partial<{
		username: string; firstname: string; lastname: string;
		email: string; role: number | string | null; projects: string[ ]
	}> ) {
        const response = await http.patch( "/api/v1/admin/updateUser", user );

        return response;
    }
}

const adminService = new AdminService( );
export default adminService;
