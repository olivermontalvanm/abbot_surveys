require('module-alias/register');
require( "../config.js" );
const Users = require('../models/user.js');
require( "../models/index" );

/**
 * Renames user 'paola.garita' to 'dayanna.rivera', keeping the same row (id, password,
 * role, country and submissions). Safe to run more than once.
 *
 * Run from project root (before seeders/special_activities_form.js):
 * npx sequelize-cli db:seed --seed seeders/rename_paola_to_dayanna.js --env { env }
 *
 * Undo:
 * npx sequelize-cli db:seed:undo --seed seeders/rename_paola_to_dayanna.js --env { env }
 */

const OLD_USERNAME = "paola.garita";
const NEW_USERNAME = "dayanna.rivera";

module.exports = {
    write( text, newLine = false ) {
        const content = `${ text }${ newLine ? "\n" : "" }`;

        process.stdout.write( content );
    },

    async rename( from, to ) {
        this.write( `Renaming user '${ from }' to '${ to }'...` );

        const oldUser = await Users.findOne( { where: { username: from } } );
        const newUser = await Users.findOne( { where: { username: to } } );

        if( oldUser && newUser ) {
            throw new Error( `Both '${ from }' and '${ to }' exist, resolve it manually` );
        }

        if( !oldUser ) {
            this.write( newUser ? "Already renamed" : `User '${ from }' not found`, true );
            return;
        }

        await Users.update( { username: to }, { where: { id: oldUser.id } } );
        this.write( `OK (id ${ oldUser.id })`, true );
    },

    async up( ) {
        try {
            await this.rename( OLD_USERNAME, NEW_USERNAME );
        } catch ( e ) {
            console.error( "❌", e );
            console.info( "Exiting" );
        }
    },

    async down( ) {
        try {
            await this.rename( NEW_USERNAME, OLD_USERNAME );
        } catch ( e ) {
            console.error( "❌", e );
            console.info( "Exiting" );
        }
    }
};
