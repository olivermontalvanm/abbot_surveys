import { FC } from "react";
import RequestsTable from "../features/requests/RequestsTable";
import { RequestCategory } from "../interfaces/Common";

const Requests: FC<{ isMobile: boolean; category: RequestCategory; }> = ( { isMobile, category } ) => {
    return (
        <RequestsTable key={ category } category={ category } isMobile={ isMobile } />
    )
}

export default Requests;
