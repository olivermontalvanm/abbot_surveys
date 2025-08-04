import http from "./Http";
//import mockHttp from "./MockHttp";

class UserService {
    async getLoggedUser( ) {
        const response = await http.get( "/api/v1/auth/loggedUser" );

        return response;
    }
}

const userService = new UserService( );
export default userService;
