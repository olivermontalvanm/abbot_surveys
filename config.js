"use strict";

const path = require( "path" );
const dotenv = require( "dotenv" );
dotenv.config( );

const config = {
    environment: process.env.ENVIRONMENT ?? "development",
    app: {
        host: process.env.APP_HOST ?? "localhost",
        port: process.env.APP_PORT ?? 3000,
        ssl: {
            certPath: process.env.SSL_CERT_PATH,
            keyPath: process.env.SSL_KEY_PATH
        }
    },
    sqlConfig: {
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        server: process.env.SQL_HOST,
        database: process.env.SQL_DATABASE,
        options: { trustServerCertificate: true, encrypt: false },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }   
    },
    jwtSecret: process.env.JWT_SECRET,
    email: {
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PASS,
        sendTo: process.env.MAIL_SEND_TO,
        skip: ( process.env.MAIL_SKIP && process.env.MAIL_SKIP == "true" ),
        service: process.env.MAIL_SERVICE ?? "hotmail"
    }
};

module.exports = config;