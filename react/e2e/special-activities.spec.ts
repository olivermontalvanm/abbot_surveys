import { test, expect, Page } from "@playwright/test";
import fs from "fs";
import { connect, e2eUsers, readCredentials, E2EUserKey } from "./db";

async function login( page: Page, who: E2EUserKey ) {
    const password = readCredentials( )[ who ];

    await page.goto( "/login" );
    await page.getByPlaceholder( "jperez" ).fill( e2eUsers[ who ].username );
    await page.locator( "input[type=password]" ).fill( password );
    await page.getByRole( "button", { name: "Ingresar" } ).click( );
    await expect( page ).toHaveURL( /\/surveys$/ );
}

//  Same temporary list the backend merges into the hospitals found in the answers
const clientHospitals: Record<string, string[ ]> = JSON.parse(
    fs.readFileSync( new URL( "../../data/client_hospitals.json", import.meta.url ), "utf-8" )
);

async function expectedHospitals( country?: string ) {
    const hospitals = await hospitalsFromDb( country );
    const known = new Set( hospitals.map( h => `${ h.country }|${ h.hospital.toUpperCase( ) }` ) );

    for( const [ hCountry, names ] of Object.entries( clientHospitals ) ) {
        if( country && hCountry !== country ) continue;

        for( const hospital of names ) {
            const key = `${ hCountry }|${ hospital.toUpperCase( ) }`;

            if( !known.has( key ) ) {
                known.add( key );
                hospitals.push( { country: hCountry, hospital } );
            }
        }
    }

    return hospitals;
}

async function hospitalsFromDb( country?: string ) {
    const db = await connect( );

    try {
        const [ rows ] = await db.query( `
            SELECT TRIM( p.value ) AS country, MIN( TRIM( h.value ) ) AS hospital
            FROM Answer h
            INNER JOIN Question hq ON h.questionid = hq.id AND hq.label IN ( 'Nombre del hospital', 'Hospital' )
            INNER JOIN Answer p ON p.submissionid = h.submissionid
            INNER JOIN Question pq ON p.questionid = pq.id AND pq.label = 'País'
            WHERE TRIM( h.value ) <> '' AND TRIM( p.value ) <> ''
            ${ country ? "AND TRIM( p.value ) = ?" : "" }
            GROUP BY TRIM( p.value ), UPPER( TRIM( h.value ) )
        `, country ? [ country ] : [ ] );

        return rows as { country: string; hospital: string }[ ];
    } finally {
        await db.end( );
    }
}

const longTopic = "Capacitación sobre nutrición enteral en pacientes críticos, " +
    "manejo de bombas de infusión, \"buenas prácticas\" y revisión de casos clínicos del servicio. ".repeat( 4 );

test.describe.serial( "Capacitaciones Especiales", ( ) => {
    test( "usuario con país: ve la tarjeta, solo hospitales de su país y puede enviar", async ( { page } ) => {
        await login( page, "user" );

        const card = page.getByRole( "button", { name: /Capacitaciones Especiales/ } );
        await expect( card ).toBeVisible( );
        await card.click( );
        await expect( page ).toHaveURL( /\/forms\/special-activities$/ );
        await expect( page.getByRole( "heading", { name: "Capacitaciones Especiales" } ) ).toBeVisible( );

        //  Not an admin: no link to responses
        await expect( page.getByRole( "button", { name: /Ver respuestas/ } ) ).toHaveCount( 0 );

        const submit = page.getByRole( "button", { name: "Enviar" } );
        await expect( submit ).toBeDisabled( );

        //  Hospital list = distinct hospitals of Guatemala only, no country groups
        const expected = await expectedHospitals( "Guatemala" );
        const hospitalInput = page.getByRole( "combobox", { name: "Hospital" } );
        await hospitalInput.click( );
        const options = page.getByRole( "option" );
        await expect( options ).toHaveCount( expected.length );
        await expect( page.locator( ".MuiAutocomplete-groupLabel" ) ).toHaveCount( 0 );
        //  From the client's list, not present in the answers
        await expect( page.getByRole( "option", { name: "Seguro social zona 9", exact: true } ) ).toHaveCount( 1 );

        const hospital = expected.find( h => h.hospital === "Hospital Roosevelt" )?.hospital ?? expected[ 0 ].hospital;
        await hospitalInput.fill( hospital );
        await page.getByRole( "option", { name: hospital, exact: true } ).click( );
        await expect( submit ).toBeDisabled( );

        await page.getByRole( "combobox", { name: "Marca abordada" } ).click( );
        await expect( page.getByRole( "option" ) ).toHaveText( [ "Osmolite", "Glucerna 1.5", "Jevity", "Otros" ] );
        await page.getByRole( "option", { name: "Glucerna 1.5" } ).click( );
        await expect( submit ).toBeDisabled( );

        await page.getByRole( "textbox", { name: "Tema abordado" } ).fill( longTopic );
        await expect( submit ).toBeDisabled( );

        await page.getByRole( "textbox", { name: "Cantidad de asistentes" } ).fill( "25" );
        await expect( submit ).toBeEnabled( );

        await page.getByRole( "textbox", { name: "Comentarios" } ).fill( "Comentario de prueba E2E.\nSegunda línea." );

        const responsePromise = page.waitForResponse( r => r.url( ).endsWith( "/api/v1/special-activity" ) && r.request( ).method( ) === "POST" );
        await submit.click( );
        expect( ( await responsePromise ).status( ) ).toBe( 200 );

        await expect( page.getByText( "Datos enviados con éxito" ) ).toBeVisible( );
        await expect( hospitalInput ).toHaveValue( "" );
        await expect( page.getByRole( "textbox", { name: "Tema abordado" } ) ).toHaveValue( "" );
        await expect( submit ).toBeDisabled( );

        //  Hidden fields were stored from the session user / browser
        const db = await connect( );
        try {
            const [ rows ] = await db.query( `
                SELECT sa.*, u.username FROM SpecialActivities sa
                INNER JOIN Users u ON u.id = sa.userId
                WHERE u.username = ?
            `, [ e2eUsers.user.username ] );
            const saved = rows as Record<string, string>[ ];

            expect( saved ).toHaveLength( 1 );
            expect( saved[ 0 ] ).toMatchObject( {
                country: "Guatemala",
                hospital,
                brand: "Glucerna 1.5",
                topic: longTopic.trim( ),
                attendees: "25",
                comments: "Comentario de prueba E2E.\nSegunda línea.",
                location: "https://www.google.com/maps/place/14.6349,-90.5069"
            } );
            expect( saved[ 0 ].date ).toMatch( /^\d{2}\/\d{2}\/\d{4}$/ );
            expect( saved[ 0 ].time ).toMatch( /^\d{2}:\d{2} (am|pm)$/ );
        } finally {
            await db.end( );
        }
    } );

    test( "admin: ve hospitales de todos los países agrupados, las respuestas y descarga el CSV", async ( { page } ) => {
        await login( page, "admin" );

        await page.getByRole( "button", { name: /Capacitaciones Especiales/ } ).click( );
        await expect( page ).toHaveURL( /\/forms\/special-activities$/ );

        const expected = await expectedHospitals( );
        const countries = [ ...new Set( expected.map( h => h.country ) ) ];
        expect( countries.length ).toBeGreaterThan( 1 );

        await page.getByRole( "combobox", { name: "Hospital" } ).click( );
        await expect( page.getByRole( "option" ) ).toHaveCount( expected.length );
        await expect( page.locator( ".MuiAutocomplete-groupLabel" ) ).toHaveText( countries.sort( ( a, b ) => a.localeCompare( b ) ) );
        await expect( page.getByRole( "option", { name: "CEDIMAT", exact: true } ) ).toHaveCount( 1 );

        //  Admin has no country: the activity takes the hospital's country
        await page.getByRole( "option", { name: "CEDIMAT", exact: true } ).click( );
        await page.getByRole( "combobox", { name: "Marca abordada" } ).click( );
        await page.getByRole( "option", { name: "Osmolite" } ).click( );
        await page.getByRole( "textbox", { name: "Tema abordado" } ).fill( "Actividad registrada por admin" );
        await page.getByRole( "textbox", { name: "Cantidad de asistentes" } ).fill( "8" );
        await page.getByRole( "button", { name: "Enviar" } ).click( );
        await expect( page.getByText( "Datos enviados con éxito" ) ).toBeVisible( );

        const db = await connect( );
        try {
            const [ rows ] = await db.query( `
                SELECT sa.country, sa.hospital FROM SpecialActivities sa
                INNER JOIN Users u ON u.id = sa.userId
                WHERE u.username = ?
            `, [ e2eUsers.admin.username ] );

            expect( rows ).toEqual( [ { country: "República Dominicana", hospital: "CEDIMAT" } ] );
        } finally {
            await db.end( );
        }

        await page.getByRole( "button", { name: /Ver respuestas/ } ).click( );
        await expect( page ).toHaveURL( /\/replies\/special-activities$/ );

        const row = page.getByTestId( "special-activity-row" ).filter( { hasText: e2eUsers.user.username } );
        await expect( row ).toHaveCount( 1 );
        await expect( row ).toContainText( "Glucerna 1.5" );
        await expect( row ).toContainText( "Guatemala" );
        await expect( row ).toContainText( "25" );

        const downloadPromise = page.waitForEvent( "download" );
        await page.getByRole( "button", { name: "Descargar" } ).click( );
        const download = await downloadPromise;

        expect( download.suggestedFilename( ) ).toMatch( /^capacitaciones_especiales_\d{8}_\d{6}\.csv$/ );

        const csv = fs.readFileSync( await download.path( ), "utf-8" ).replace( /^﻿/, "" );
        const [ header ] = csv.split( "\n" );

        expect( header ).toBe( "Usuario,Fecha,Hora,País,Ubicación,Hospital,Marca abordada,Tema abordado,Cantidad de asistentes,Comentarios" );
        expect( csv ).toContain( `"${ e2eUsers.user.username }"` );
        expect( csv ).toContain( "\"Glucerna 1.5\"" );
        expect( csv ).toContain( `"${ e2eUsers.admin.username }"` );
        expect( csv ).toContain( "\"República Dominicana\",\"https://www.google.com/maps/place/14.6349,-90.5069\",\"CEDIMAT\"" );
        //  Quotes inside values are escaped
        expect( csv ).toContain( "\"\"buenas prácticas\"\"" );
    } );

    test( "regresión: la tarjeta Visitas sigue abriendo su formulario", async ( { page } ) => {
        await login( page, "user" );

        await page.getByRole( "button", { name: /Visitas/ } ).click( );
        await expect( page ).toHaveURL( /\/forms\/visits$/ );
    } );
} );
