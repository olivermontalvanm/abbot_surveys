import http from "./Http";
import mockHttp from "./MockHttp";
import { User } from "../interfaces/Models";

class AuthService {
    async login( user: { username: string; password: string; } ) {
        const response = await http.post<User&{ token: string; }>( "/api/v1/login", user );

        return response;
    }

    async logout( ) {
        const response = await http.post( "/api/v1/auth/logout" );

        return response;
    }

    async requestUserPassChange( params: { username: string; } ) {
        const response = await mockHttp.post( "/api/v1/auth/requestPassChange", params );

        return response;
    }
}

const authService = new AuthService( );
export default authService;
