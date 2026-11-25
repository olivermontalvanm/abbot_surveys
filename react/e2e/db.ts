import { createRequire } from "module";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const here = path.dirname( fileURLToPath( import.meta.url ) );

//  Reuse the backend's dependencies and .env (local development DB)
const rootDir = path.resolve( here, "../.." );
const rootRequire = createRequire( path.join( rootDir, "package.json" ) );
rootRequire( "dotenv" ).config( { path: path.join( rootDir, ".env" ) } );
const mysql = rootRequire( "mysql2/promise" );

export const FORM_TITLE = "Actividades Especiales";
export const credentialsFile = path.join( here, ".env.e2e" );

export const e2eUsers = {
    user: { username: "e2e.guatemala", country: "Guatemala", role: "user" },
    admin: { username: "e2e.admin", country: null, role: "admin" }
} as const;

export type E2EUserKey = keyof typeof e2eUsers;

export async function connect( ) {
    if( process.env.ENVIRONMENT !== "development" || process.env.SQL_HOST !== "localhost" ) {
        throw new Error( "E2E tests must run against the local development database" );
    }

    return mysql.createConnection( {
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE
    } );
}

export function generatePassword( ) {
    return crypto.randomBytes( 12 ).toString( "base64url" );
}

export function readCredentials( ): Record<E2EUserKey, string> {
    return JSON.parse( fs.readFileSync( credentialsFile, "utf-8" ) );
}
