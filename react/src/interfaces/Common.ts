export interface CatalogOption {
    id: number | null | string;
    label: string;
};

export type RequestCategory = [ "review", "assign", "pending", "progress", "completed" ][ number ];
