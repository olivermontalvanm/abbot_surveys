import http from "./Http";
import { Project } from "../interfaces/Models";

class ProjectService {
    async getLoggedUserProjects( ) {
        const response = await http.post<Project[ ]>( "/api/v1/project/getLoggedUserProjects" );

        return response;
    }
}

const projectService = new ProjectService( );
export default projectService;
