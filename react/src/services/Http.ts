import axios, { AxiosResponse } from "axios";

const http = axios.create( {
    baseURL: import.meta.env.VITE_API_HOST,
    headers: { "Content-type": "application/json" },
    withCredentials: true
} );

const token = localStorage.getItem( "token" ) || "";

if( token ) {
    http.defaults.headers.common[ "Authorization" ] = `Bearer ${ token }`;
}

http.interceptors.request.use( ( config ) => {
    if( config.data instanceof FormData ) {
        // When sending FormData, remove the JSON Content-Type,
        // allowing the browser to set it with the correct boundary.
        delete config.headers[ "Content-Type" ];
    }
    return config;
}, ( error ) => {
    return Promise.reject( error );
} );

http.interceptors.response.use( res => res, ( val: AxiosResponse ) => {
    if( val.status == 401 )
        window.location.href = "/login";
    
    return val;
} );

export default http;
