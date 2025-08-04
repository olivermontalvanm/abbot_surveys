import { ChartConfig } from "../pages/Dashboard";
import { RequestUtils } from "./Utils";
import { Request } from "../interfaces/Models";
import { requestStatuses } from "../constants";
import { CatalogOption } from "../interfaces/Common";

export default class ChartHelper {

    ALL_REQUEST_LABELS;
    ALL_REQUEST_STATUSES;
    SHOPPING_ANALYSTS;
    PROJECTS;

    XAxisOptions: CatalogOption[ ];
    
    YAxisOptions: CatalogOption[ ];    

    
    constructor( data: { shoppingAnalysts: CatalogOption[ ], projects: CatalogOption[ ] } ) {
        this.ALL_REQUEST_STATUSES = [
            ...Object.values( requestStatuses.costStatuses ),
            ...Object.values( requestStatuses.shoppingStatuses )
        ];
        
        this.ALL_REQUEST_LABELS = this.ALL_REQUEST_STATUSES.map( r => r.label );

        this.SHOPPING_ANALYSTS = data.shoppingAnalysts;
        this.PROJECTS = data.projects;

        this.XAxisOptions = [
            { id: "status", label: "Estatus" },
            { id: "assignee", label: "Persona asignada" },
            { id: "priority", label: "Prioridad" },
            { id: "expiration", label: "Expiración" },
            { id: "project", label: "Proyecto" }
        ];

        this.YAxisOptions = [
            { id: "amount", label: "Cantidad" },
        ];
    }
    
    getRequestsByStatus: ( requests: Request[ ], statuses: string[ ] ) => number[ ] = ( requests, statuses ) => {
        const data: number[ ] = [ ];

        for( const status of statuses ) {
            const countPerStatus = (
                requests.filter( req => RequestUtils.getRequestPredominantStatus( req ) == status )
                .map( r => r.id ).length
            );

            data.push( countPerStatus );
        }

        return data;
    }

    getRequestsByProject: ( requests: Request[ ], projectIds: number[ ] ) => number[ ] = ( requests, projectIds ) => {
        const data: number[ ] = [ ];

        for( const projectId of projectIds ) {
            const projectRequests = (
                requests.filter( req => req.project?.id == projectId )
                .map( r => r.id ).length
            );

            data.push( projectRequests );
        }

        return data;
    }

    getRequestsByAssignee: ( requests: Request[ ], assigneeIds: number[ ] ) => number[ ] = ( requests, assigneeIds ) => {
        const data: number[ ] = [ ];

        for( const assigneeId of assigneeIds ) {
            const countPerAssignee = (
                requests.filter( req => req.assignee?.id == assigneeId )
                .map( r => r.id ).length
            );

            data.push( countPerAssignee );
        }

        return data;
    }

    getRequestsByPriority: ( requests: Request[ ], priorities: [ "Normal", "Urgente" ] ) => number[ ] = ( requests, priorities ) => {
        const data: number[ ] = [ ];

        for( const priority of priorities ) {
            let predicate: ( request: Request ) => boolean = ( ) => false;

            switch( priority ) {
                case "Normal":
                    predicate = ( req: Request ) => req.isUrgent == false;
                    break;

                case "Urgente":
                    predicate = ( req: Request ) => req.isUrgent == true;
                    break;
            }
            
            const priorityCount = (
                requests.filter( predicate )
                .map( r => r.id ).length
            );

            data.push( priorityCount );
        }

        return data;
    }

    getRequestsByExpiration: ( requests: Request[ ], expirations: [ "A tiempo", "Retrasado" ] ) => number[ ] = ( requests, expirations ) => {
        const data: number[ ] = [ ];

        for( const priority of expirations ) {
            let predicate: ( request: Request ) => boolean = ( ) => false;

            switch( priority ) {
                case "A tiempo":
                    predicate = ( req: Request ) => RequestUtils.isExpired( req ) == false;
                    break;

                case "Retrasado":
                    predicate = ( req: Request ) => RequestUtils.isExpired( req ) == true;
                    break;
            }
            
            const priorityCount = (
                requests.filter( predicate )
                .map( r => r.id ).length
            );

            data.push( priorityCount );
        }

        return data;
    }

    getXAxis: ( settings: ChartConfig ) => { label: string, values: string[ ] } = ( settings ) => {
        let labels;
        
        switch( settings.xAxis.id ) {
            case "status":
                labels = this.ALL_REQUEST_LABELS;

                if( settings.statuses?.length )
                    labels = settings.statuses.map( s => s.label );
                
                return { 
                    label: "Estatus",
                    values: labels
                };

            case "assignee":
                labels = this.SHOPPING_ANALYSTS.map( sa => sa.label );

                if( settings.assignee?.length )
                    labels = settings.assignee.map( a => a.label );

                return {
                    label: "Responsable",
                    values: labels
                };

            case "priority":
                labels = [ "Normal", "Urgente" ];

                return {
                    label: "Prioridad",
                    values: labels
                };

            case "expiration":
                labels = [ "A tiempo", "Retrasado" ];

                return {
                    label: "Expiración",
                    values: labels
                };

            case "project":
                labels = this.PROJECTS.map( p => p.label );

                if( settings.projects?.length )
                    labels = settings.projects.map( p => p.label );

                return {
                    label: "Projecto",
                    values: labels
                };
        }

        return {
            label: "", values: [ ]
        };
    };

    getYAxis: ( settings: ChartConfig, requests: Request[ ] ) => { label: string, values: number[ ] } = ( settings, requests ) => {
        let labelIds;
        
        switch( settings.yAxis.id ) {
            case "amount":
                switch( settings.xAxis.id ) {
                    case "status":
                        labelIds = this.ALL_REQUEST_STATUSES.map( rs => rs.id );

                        if( settings.statuses?.length )
                            labelIds = settings.statuses.map( s => s.id as string );
                        
                        return {
                            label: "Cantidad",
                            values: this.getRequestsByStatus( requests, labelIds )
                        };

                    case "assignee":
                        labelIds = this.SHOPPING_ANALYSTS.map( sa => sa.id as number );

                        if( settings.assignee?.length )
                            labelIds = settings.assignee.map( sa => sa.id as number );

                        return {
                            label: "Responsable",
                            values: this.getRequestsByAssignee( requests, labelIds )
                        };

                    case "priority":
                        return {
                            label: "Prioridad",
                            values: this.getRequestsByPriority( requests, [ "Normal", "Urgente" ] )
                        };

                    case "expiration":
                        return {
                            label: "Expiración",
                            values: this.getRequestsByExpiration( requests, [ "A tiempo", "Retrasado" ] )
                        }

                    case "project":
                        labelIds = this.PROJECTS.map( p => p.id as number );

                        if( settings.projects?.length )
                            labelIds = settings.projects.map( p => p.id as number );
                        
                        return {
                            label: "Proyecto",
                            values: this.getRequestsByProject( requests, labelIds )
                        }
                }
        }

        return { label: "", values: [ ] };
    };

    getChartData: ( chartSettings: ChartConfig, requests: Request[ ] ) => ( { xAxis: { label: string, values: string[ ] }, yAxis: { label: string, values: number[ ] } } ) = ( chartSettings, requests ) => {
        const xAxis = this.getXAxis( chartSettings );
        const yAxis = this.getYAxis( chartSettings, requests );

        return { xAxis, yAxis };
    };
}
