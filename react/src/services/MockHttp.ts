import mockData from "../store/mockedData.json";

class MockAPI {
    response( url: string, data: object, status: number, params?: object ): Promise<{ data: object; status: number; }> | null {
        console.debug( "🚀 HTTP Mock Service: ", { url, data, status, params } );
        return new Promise( r => r( { data, status } ) );
    }
	
    post( url: string, param?: object ): Promise<{ data: object; status: number; }> | null {
        if( !param ) param = {};
		
        const nParam = param as never;
        let foundUser;

        switch( url ) {
            case "/api/v1/auth/login":
                foundUser = mockData.users.find( u => u.username == nParam[ "username" ] && u.password == nParam[ "password" ] );

                if( foundUser ) {
                    return this.response( url, foundUser, 200, param );
                } else {
                    return this.response( url, {}, 401 );
                }

            case "/api/v1/auth/logout":
                return this.response( url, mockData.mockResponses[ url ], 200 );

            case "/api/v1/auth/requestPassChange":
                return this.response( url, mockData.mockResponses[ url ], 200, param );
        }

        console.error( `❌ HTTP Unsupported POST route "${ url }"` );
        throw new Error( `Unsupported POST route "${ url }"` );
    }

    get( url: string ): Promise<{ data: object }> | null {
        let foundUser;

        switch( url ) {
            case "/api/v1/user/logged":
                foundUser = JSON.parse( window.getAppItem( "loggedUser" ) ?? "" );
				
                return this.response( url, foundUser, 200 );
        }

        console.error( `❌ HTTP Unsupported GET route "${ url }"` );
        throw new Error( `Unsupported GET route "${ url }"` );
    }
}

const http = new MockAPI( );

export default http;
