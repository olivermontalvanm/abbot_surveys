"use strict";
process.env.TZ = "UTC";

require('module-alias/register');
const express = require( "express" );
const compression = require( "compression" );
const cors = require( "cors" );
const config = require( "./config.js" );
const { syncDatabase } = require( "./models/index.js" );
const https = require( "https" );
const fs = require( "fs" );

const app = express( );

function registerControllers( ) {
    app.options( "*", cors( { credentials: true, origin: true } ) );
    app.set( "trust proxy", true );

    app.get( "/ping", ( _, res ) => res.status( 200 ).send( "\n🎾 Pong!\n\n" ) );
    
    const SurveyController = require( "./controllers/survey.js" );
    
    app.use( compression( ) );
    app.use( cors( { credentials: true, origin: true } ) );
    app.use( express.json( ) );
    app.use( "/api/v1/", SurveyController.router );
}

function registerEventHandlers( ) {
    process.on( "uncaughtException", ( e ) => {
        console.debug( { e } );
        console.error( "❌ Uncaught exception during execution" );
        process.exit( 1 ); 
    } );

    process.on( "SIGINT", ( ) => {
        console.info( "🤖 Signal SIGINT received" );
        process.exit( 0 );
    } );

    process.on( "ETIMEOUT", ( ) => {
        console.error( "❌ Main process timed out" );
        process.exit( 1 );
    } );

    console.info( "🤖 Registered event handlers" );
}

function startServer( ) {
    /*if( config.app.ssl.certPath && config.app.ssl.keyPath ) {
        const options = {
            key: fs.readFileSync( config.app.ssl.keyPath ),
            cert: fs.readFileSync( config.app.ssl.certPath )
        };
        
        https.createServer( options, app ).listen( config.app.port, ( ) => {
            process.send( "ready" );
            console.info( `🌐🔒 Application listening at https://${ config.app.host }:${ config.app.port }` );
        } );
    } else {*/
        app.listen( config.app.port, config.app.host, () => {
            if( process.send )  {
                process.send( "ready" );
            }
            console.info( `🌐 Application listening at: http://${ config.app.host }:${ config.app.port }`);
        } );
    //}
}

( async function main( ) {
    try {
        syncDatabase( )
        .then( ( ) => {
            registerEventHandlers( );
            registerControllers( );
            startServer( );    
        } )
        .catch( err => {
            console.error( "❌ Could not connect to database: ", err );
        } );
    } catch ( e ) {
        console.error( "❌ Error while starting app: ", e );
    }
} )( );
