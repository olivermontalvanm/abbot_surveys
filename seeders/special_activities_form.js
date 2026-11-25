require('module-alias/register');
require( "../config.js" );
const { DataTypes, Op } = require( "sequelize" );
const Surveys = require( "../models/survey" );
const Users = require('../models/user.js');
const SurveyAccess = require("../models/surveyAccess.js");
require( "../models/index" );

/**
 * Creates the "Actividades Especiales" form: its table, its Survey entry (used for access
 * control only) and access for ALLOWED_USERNAMES only (any other user's access is removed).
 * Safe to run more than once.
 *
 * Run from project root:
 * npx sequelize-cli db:seed --seed seeders/special_activities_form.js --env development
 * npx sequelize-cli db:seed --seed seeders/special_activities_form.js --env production
 *
 * Undo (keeps the table and its data):
 * npx sequelize-cli db:seed:undo --seed seeders/special_activities_form.js --env { env }
 */

const FORM_TITLE = "Actividades Especiales";
const TABLE_NAME = "SpecialActivities";
const ALLOWED_USERNAMES = [ "dayanna.rivera" ];

module.exports = {
    write( text, newLine = false ) {
        const content = `${ text }${ newLine ? "\n" : "" }`;

        process.stdout.write( content );
    },

    async up( interface ) {
        try {
            this.write( `Creating table '${ TABLE_NAME }'...` );
            if( !( await interface.tableExists( TABLE_NAME ) ) ) {
                await interface.createTable( TABLE_NAME, {
                    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
                    userId: {
                        type: DataTypes.INTEGER, allowNull: false,
                        references: { model: "Users", key: "id" },
                        onUpdate: "CASCADE", onDelete: "CASCADE"
                    },
                    date: { type: DataTypes.STRING, allowNull: false },
                    time: { type: DataTypes.STRING, allowNull: false },
                    country: { type: DataTypes.STRING, allowNull: true },
                    location: { type: DataTypes.STRING, allowNull: false },
                    hospital: { type: DataTypes.STRING, allowNull: false },
                    brand: { type: DataTypes.STRING, allowNull: false },
                    topic: { type: DataTypes.TEXT, allowNull: false },
                    attendees: { type: DataTypes.STRING, allowNull: false },
                    comments: { type: DataTypes.TEXT, allowNull: true },
                    createdAt: { type: DataTypes.DATE, allowNull: false },
                    updatedAt: { type: DataTypes.DATE, allowNull: false }
                } );
                this.write( "OK", true );
            } else {
                this.write( "Already existed", true );
            }

            this.write( `Creating form '${ FORM_TITLE }'...` );
            let form = await Surveys.findOne( { where: { title: FORM_TITLE } } );

            if( !form ) {
                form = await Surveys.create( { title: FORM_TITLE, limitedAccess: true } );
                this.write( "OK", true );
            } else {
                this.write( "Already existed", true );
            }

            form = form.toJSON( );

            const allowedUsers = ( await Users.findAll( { where: { username: ALLOWED_USERNAMES } } ) ).map( r => r.toJSON( ) );

            for( const username of ALLOWED_USERNAMES ) {
                if( !allowedUsers.some( u => u.username === username ) ) {
                    this.write( `⚠️  User '${ username }' not found, no access granted`, true );
                }
            }

            this.write( `Removing access of other users to '${ FORM_TITLE }'...` );
            const revoked = await SurveyAccess.destroy( {
                where: {
                    surveyId: form.id,
                    userId: { [ Op.notIn ]: allowedUsers.length ? allowedUsers.map( u => u.id ) : [ 0 ] }
                }
            } );
            this.write( `${ revoked } removed`, true );

            this.write( `Agregando acceso a '${ FORM_TITLE }'...`, true );
            for( const user of allowedUsers ) {
                this.write( `\tAcceso a usuario '${ user.username }'...` );

                //  User does not have access
                if( !( !!await SurveyAccess.findOne( { where: { userId: user.id, surveyId: form.id } } ) ) ) {
                    await interface.insert(
                        null,
                        "SurveyAccess",
                        { userId: user.id, surveyId: form.id }
                    );
                    this.write( "Access granted", true );
                } else {    //  Already has access
                    this.write( "Already had access", true );
                }
            }
        } catch ( e ) {
            console.error( "❌", e );
            console.info( "Exiting" );

            console.info( "You should execute rollback" );
        }
    },

    async down( interface ) {
        const form = await Surveys.findOne( { where: { title: FORM_TITLE } } );

        if( !form ) {
            this.write( `Form '${ FORM_TITLE }' not found`, true );
            return;
        }

        this.write( `Removing access to '${ FORM_TITLE }'...` );
        await interface.bulkDelete( "SurveyAccess", { surveyId: form.id } );
        this.write( "OK", true );

        this.write( `Removing form '${ FORM_TITLE }'...` );
        await interface.bulkDelete( "Survey", { id: form.id } );
        this.write( "OK", true );

        this.write( `Table '${ TABLE_NAME }' was kept with its data`, true );
    }
};
