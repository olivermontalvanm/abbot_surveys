import http from "./Http";

class SummaryService {
    async getUsers( ) {
        const response = await http.get( "/api/v1/summary/users" );

        return response;
    }
}

const adminService = new SummaryService( );
export default adminService;
