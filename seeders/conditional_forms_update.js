require('module-alias/register');
require( "../config.js" );
const path = require('path');
const Surveys = require( "../models/survey" );
const Users = require('../models/user.js');
const Questions = require('../models/question.js');
const Options = require('../models/option.js');
const SurveyAccess = require("../models/surveyAccess.js");
require( "../models/index" );

/**
 * Run this by doing:
 * 
 * Migrate:
 * npx sequelize-cli db:seed:all
 * npx sequelize-cli db:seed --seed { filepath }
 * npx sequelize-cli db:seed --seed { filepath } --env development
 * 
 * Undo:
 * npx sequelize-cli db:seed:undo:all
 * npx sequelize-cli db:seed:undo --seed { filepath }
 * npx sequelize-cli db:seed:undo --seed { filepath } --env development
 * 
 * Run from project root.
 */ 

module.exports = {
    write( text, newLine = false ) {
        const content = `${ text }${ newLine ? "\n" : "" }`;
        
        process.stdout.write( content );
    },
    
    async up( interface ) {
        try {
            const newUsernames = [ "ana.costarica", "ana.bourne" ];
            const newFormTitles = [ "Nuevo Form 1", "Nuevo Form 2" ];

            let visitsForm = { title: "Visitas", limitedAccess: true };

            this.write( "Limit access to all surveys...");
            //  A form with free access exists
            if(!!await Surveys.findOne({where: { limitedAccess: false }})) {
                await interface.bulkUpdate( "Survey", { limitedAccess: true }, {} );
                this.write( "OK", true );
            } else {
                this.write( "No unlimited forms found", true);
            }
            
            this.write( "Creating new visits form..." );
            //  Visits form does not exist
            if(!(!!await Surveys.findOne({where:{title: "Visitas"}}))) {
                visitsForm = (await Surveys.create(Object.assign({}, visitsForm))).toJSON();
                this.write( "OK", true );
            } else {
                this.write( "Already existed", true );
            }

            const allUsers = ( await Users.findAll({ 
                where: {}
            })).map( r => r.toJSON() );

            const legacyUsers = allUsers.filter( u => !newUsernames.includes( u.username ) );
            const newUsers = allUsers.filter( u => newUsernames.includes( u.username ) );

            const allForms = (await Surveys.findAll({
                where: {}
            })).map(r => r.toJSON());

            const legacyForms = allForms.filter( f => !newFormTitles.includes( f.title ) );
            const newForms = allForms.filter( f => newFormTitles.includes( f.title ) );

            this.write( "Agregando acceso a forms legacy...", true );
            for(const form of legacyForms) {
                for(const user of legacyUsers ) {
                    this.write( `\tAcceso a usuario '${ user.username }' en form '${ form.title }'...`);
                    
                    //  User does not have access
                    if(!(!!await SurveyAccess.findOne({ where: { userId: user.id, surveyId: form.id } }))) {
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
            }

            const newUsersPlusAdmins = [ 
                ...newUsers, 
                ...allUsers.filter( u => [ "ignacio.acosta", "paola.garita" ].includes( u.username ) )
            ];

            this.write( "Agregando acceso a forms nuevos...", true );
            for(const form of newForms) {
                for(const user of newUsersPlusAdmins ) {
                    this.write( `\tAcceso a usuario '${ user.username }' en form '${ form.title }'...`);
                    
                    //  User does not have access
                    if(!(!!await SurveyAccess.findOne({ where: { userId: user.id, surveyId: form.id } }))) {
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
            }
        } catch ( e ) {
            console.error( "❌", e );
            console.info( "Exiting" );

            console.info( "You should execute rollback" );
        }
    },

    async down( interface ) {
        console.info( "Not implemented" );
    }
};
