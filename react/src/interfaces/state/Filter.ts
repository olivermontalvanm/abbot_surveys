import { CatalogOption } from "../Common";
import { Project, Activity } from "../Models";

export interface Filter {
    activityOptions: Activity[];
    statusOptions: { label: string; value: string; }[];
    projectOptions: Project[];

    selectedActivity: Activity | null;
    selectedStatus: { label: string; value: string; }|null;
    selectedProject: Project | null;
    searchInputValue: string;
    requestNumber: string;

    projectsFilter: CatalogOption[ ];
}
