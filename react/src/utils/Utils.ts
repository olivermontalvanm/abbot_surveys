import { Request, User } from "../interfaces/Models";
import { requestStatuses, userRoles } from "../constants";
import dayjs from "dayjs";
import { Theme } from "@mui/material";

class UserUtils {
    getFullName( user: User | null ) {
        if( !user ) return null;

        return `${ user.firstname } ${user.lastname}`;
    }
}

class RequestUtilsC {
    getRequestPredominantStatus: ( request: Request ) => string = ( request: Request ) => {
        if( request.shoppingStatus ) {
            return request.shoppingStatus;
        }

        return request.costStatus ?? requestStatuses.costStatuses.pending.id;
    }
    
    canBeEdited: ( params: { request: Request, userRole: string } ) => boolean = ( { request, userRole } ) => {
        const { projectAdmin, projectOpsManagement, projectResident } = userRoles;
        
        if( ![ projectAdmin, projectOpsManagement, projectResident ].includes( userRole ) )
            return false;

        if( 
            ( request.shoppingStatus == requestStatuses.shoppingStatuses.changesRequested.id ||
            request.costStatus != requestStatuses.costStatuses.reviewed.id ) &&
            !request.finished
        )
            return true;

        return false;
    }

    isExpired( request: Request ) {
        const today = dayjs( );
        const createdAt = dayjs( request.createdAt );
    
        return today.diff( createdAt, "days" ) > 15 && request.finishedAt === null && request.shoppingDateFinished === null;
    }

    canBeDeleted: ( params: { request: Request, userRole: string } ) => boolean = ( { request, userRole } ) => {
        const { projectAdmin, projectOpsManagement, projectResident } = userRoles;
        
        if( ![ projectAdmin, projectOpsManagement, projectResident ].includes( userRole ) )
            return false;

        if( 
            request.costStatus != requestStatuses.costStatuses.reviewed.id &&
            !request.finished
        )
            return true;

        return false;
    }

    getRequestStatusLabel( request: Request ) {
        const { costStatuses, shoppingStatuses } = requestStatuses;
    
        switch( request.shoppingStatus ) {
            case shoppingStatuses.finished.id: return "Finalizado";
            case shoppingStatuses.checkReceived.id: return "Cheque en compras";
            case shoppingStatuses.checkAwait.id: return "En espera de cheque";
            case shoppingStatuses.quoting.id: return "Cotizando";
            case shoppingStatuses.exonerationAwait.id: return "En espera de exoneración";
            case shoppingStatuses.purchaseOrder.id: return "Orden de compra";
            case shoppingStatuses.transportAwait.id: return "En espera de transporte";
            case shoppingStatuses.deliveredCentralWH.id: return "Entregado en bodega central";
        }
        
        if( !request.costStatus ) return "Pendiente de revisión";
    
        switch( request.costStatus ) {
            case null:
            case costStatuses.pending.id: return "Pendiente de revisión";
            case costStatuses.reviewed.id: return "Revisado";
            case costStatuses.inquiry.id: return "Consulta";
            case costStatuses.cancelled.id: return "Anulado";
        }
    }

    getRequestStatusColor( request: Request, theme: Theme ) {
        const { shoppingStatuses } = requestStatuses;
        
        if( request.shoppingStatus == shoppingStatuses.finished.id ) return theme.palette.green;
    
        if( !request.costStatus ) return theme.palette.grayBg3;
    
        return theme.palette.blue;
    }
};

export class BizRules {
    roleRequiresProject( userRole: string ) {
        return [ 
            userRoles.projectAdmin, userRoles.projectOpsManagement, 
            userRoles.projectResident 
        ].includes( userRole );
    }
}

export class RegexUtils {
    validateEmail( value: string ) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

        return regex.test( value );
    }

    hasSpaces( value: string ) {
        const reg = /^[^\s]*$/;

        return reg.test( value );
    }
}

export const userUtils = new UserUtils( );

export const RequestUtils = new RequestUtilsC( );

export function getSearchWithFirstPage( search: URLSearchParams ): string {
    const updatedParams = new URLSearchParams( search );
    let stringParams = "";

    if( updatedParams.has( "f_page" ) ) {
        updatedParams.set( "f_page", "1" );
    }

    stringParams = updatedParams.toString( );

    if( stringParams )
        stringParams = `?${ stringParams }`;

    return stringParams;
}
