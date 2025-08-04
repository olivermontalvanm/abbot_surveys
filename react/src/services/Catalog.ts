import http from "./Http";
import { CatalogOption } from "../interfaces/Common";
import { ProjectCatalog } from "../interfaces/state/Common";

class CatalogService {
    async getAllProjects( ) {
        const response = await http.get<ProjectCatalog[ ]>( "/api/v1/catalog/projects" );

        return response;
    }
    async getAllRoles( ) {
        const response = await http.get<CatalogOption[ ]>( "/api/v1/catalog/roles" );

        return response;
    }

    async getAllItems( ) {
        const response = await http.get<CatalogOption[ ]>( "/api/v1/catalog/items" );

        return response;
    }

    async getAllMeasureUnits( ) {
        const response = await http.get<CatalogOption[ ]>( "/api/v1/catalog/measureUnits" );

        return response;
    }

    async getAllShoppingAnalists( ) {
        const response = await http.get<CatalogOption[ ]>( "/api/v1/catalog/shoppingAnalists" );

        return response;
    }
}

const catalogService = new CatalogService( );
export default catalogService;
