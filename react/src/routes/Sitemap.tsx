class Sitemap {
    static login = "/login";

    static dashboard = "/orders/dashboard";
    static requests = "/orders/pending";
    static inProgressRequests = "/orders/progress";
    static finishedRequests = "/orders/completed";
    static archivedRequests = "/orders/archived";
    static requestsReview = "/orders/review";
    static requestsAssign = "/orders/assign";
    static users = "/admin/users";
    static requestsDetail = ( requestId: string ) => {
        return `/orders/${ requestId }`;
    };
};

export default Sitemap;
