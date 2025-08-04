import { CatalogOption } from "../Common";
import { User, Request } from "../Models";


export type ProjectCatalog = { activities: CatalogOption[ ] } & CatalogOption;

export interface CommonState {
    drawerOpened: boolean;
    toolbarOpened: boolean;

    loggedUser: User | null;

    requestedPassChange: boolean;

    projects: ProjectCatalog[ ];
    roles: CatalogOption[ ];
    items: CatalogOption[ ];
    measureUnits: CatalogOption[ ];
    shoppingAnalysts: CatalogOption[ ];

    modalOpen: boolean;
    modalComponent?: "newRequest";

    snackbar: {
        show: boolean;
        message: string;
        type: "error" | "info" | "success" | "warning"
    }

    selectedRequest: Request | null;

    isMobile: boolean;
}
