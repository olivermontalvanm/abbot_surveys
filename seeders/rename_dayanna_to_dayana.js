require('module-alias/register');
//  Same in-place rename as rename_paola_to_dayanna.js (keeps id, password, role, history)
const renameSeeder = require( "./rename_paola_to_dayanna.js" );

/**
 * Renames user 'dayanna.rivera' to 'dayana.rivera'. Safe to run more than once.
 *
 * Run from project root (before seeders/special_activities_form.js):
 * npx sequelize-cli db:seed --seed seeders/rename_dayanna_to_dayana.js --env { env }
 *
 * Undo:
 * npx sequelize-cli db:seed:undo --seed seeders/rename_dayanna_to_dayana.js --env { env }
 */

const OLD_USERNAME = "dayanna.rivera";
const NEW_USERNAME = "dayana.rivera";

module.exports = {
    async up( ) {
        try {
            await renameSeeder.rename( OLD_USERNAME, NEW_USERNAME );
        } catch ( e ) {
            console.error( "❌", e );
            console.info( "Exiting" );
        }
    },

    async down( ) {
        try {
            await renameSeeder.rename( NEW_USERNAME, OLD_USERNAME );
        } catch ( e ) {
            console.error( "❌", e );
            console.info( "Exiting" );
        }
    }
};
