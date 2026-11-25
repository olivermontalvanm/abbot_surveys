import fs from "fs";
import { connect, credentialsFile, e2eUsers, FORM_TITLE, generatePassword, E2EUserKey } from "./db";
import { cleanup } from "./global-teardown";

export default async function globalSetup( ) {
    await cleanup( );

    const db = await connect( );
    const credentials = {} as Record<E2EUserKey, string>;

    try {
        const [ forms ] = await db.query( "SELECT id, title FROM Survey WHERE title IN ( 'Visitas', ? )", [ FORM_TITLE ] );

        if( !( forms as { title: string }[ ] ).some( f => f.title === FORM_TITLE ) ) {
            throw new Error( "Run seeders/special_activities_form.js before the E2E tests" );
        }

        for( const [ key, u ] of Object.entries( e2eUsers ) as [ E2EUserKey, typeof e2eUsers[ E2EUserKey ] ][ ] ) {
            const password = generatePassword( );
            credentials[ key ] = password;

            const [ result ] = await db.query(
                "INSERT INTO Users ( username, password, country, role, createdAt, updatedAt ) VALUES ( ?, ?, ?, ?, NOW( ), NOW( ) )",
                [ u.username, password, u.country, u.role ]
            );

            for( const form of forms as { id: number }[ ] ) {
                await db.query( "INSERT INTO SurveyAccess ( userId, surveyId ) VALUES ( ?, ? )", [ ( result as { insertId: number } ).insertId, form.id ] );
            }
        }
    } finally {
        await db.end( );
    }

    fs.writeFileSync( credentialsFile, JSON.stringify( credentials ), { mode: 0o600 } );
}
