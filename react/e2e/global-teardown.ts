import fs from "fs";
import { connect, credentialsFile, e2eUsers } from "./db";

export async function cleanup( ) {
    const db = await connect( );
    const usernames = Object.values( e2eUsers ).map( u => u.username );

    try {
        //  SpecialActivities rows go away with ON DELETE CASCADE; SurveyAccess has no cascade
        await db.query( "DELETE sa FROM SurveyAccess sa INNER JOIN Users u ON u.id = sa.userId WHERE u.username IN ( ? )", [ usernames ] );
        await db.query( "DELETE FROM SpecialActivities WHERE userId IN ( SELECT id FROM Users WHERE username IN ( ? ) )", [ usernames ] );
        await db.query( "DELETE FROM Users WHERE username IN ( ? )", [ usernames ] );
    } finally {
        await db.end( );
    }
}

export default async function globalTeardown( ) {
    await cleanup( );

    fs.rmSync( credentialsFile, { force: true } );
}
