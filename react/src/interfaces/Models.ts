export interface User {
    id: number;
    username: string;
    email: string;
    roleId: number;
    userRole: {
        id: number;
        title: string;
    },
    role: number;
    firstname: string;
    lastname: string;
    projects: Project[ ];
    canResetPassword: number | null;
    forgotPassword: number | null;
    isActive: boolean;
}

export interface Activity {
    id: number;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: number;
    title: string;
    activities: Activity[ ];
}

interface Item {
    id: number;
    createdAt: string;
    description?: string;
    picture?: string;
    title: string;
    updatedAt: string;
}

interface MeasureUnit {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
}


export interface RequestNote {
    id: number;
    author: User;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    modified: boolean;
    deleted: boolean;
};

export interface Request {
    activity: Activity;
    admonStatus?: "RECIBIDO" | "CHEQUE FIRMA" | "ENTREGADO";
    costStatus?: string;
    archived: boolean;
    createdBy: User;
    item: Item;
    project: Project;
    quantity: number;
    measureUnit: MeasureUnit;
    createdAt: string;
    id: number;
    assignee: User;
    shoppingDateReceived: Date | null;
    shoppingDateFinished: Date | null;
    shoppingStatus?: string;
    shoppingReqNumber?: string;
    shoppingOrderNumber?: string;
    shoppingElapsedDays: number | null;
    reqNumber: string;
    isUrgent: boolean;
    finishedAt: string;
    notes: RequestNote[ ];
    finished: boolean;
}
