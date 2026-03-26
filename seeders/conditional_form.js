require('module-alias/register');
require( "../config.js" );
const path = require('path');
const Surveys = require( "../models/survey" );
const Users = require('../models/user.js');
const Questions = require('../models/question.js');
const Options = require('../models/option.js');
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
    async up( interface, Sequelize ) {
        try {
            const { DataTypes } = Sequelize;
            
            await interface.createTable(
                "SurveyAccess",
                {
                    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Users", key: "id" } },
                    surveyId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Survey", key: "id" } },
                }
            );
            
            await interface.addColumn(
                "Survey", "limitedAccess",
                { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false }
            );
            
            const newUsers = [
                {
                    country: 'Costa Rica',
                    username: 'ana.costarica',
                    password: 'MDK0.2026',
                    role: 'user'
                },
                {
                    country: 'Costa Rica',
                    username: 'ana.bourne',
                    password: 'MDK0.2026',
                    role: 'user'
                }
            ];
            const createdUsers = [];

            for(const newUser of newUsers) {
                const result = ( await Users.create(newUser) ).toJSON();

                createdUsers.push( result );
            }

            const newForms = [
                { title: 'Nuevo Form 1', limitedAccess: true },
                { title: 'Nuevo Form 2', limitedAccess: true }
            ];
            const createdForms = [];

            for(const newForm of newForms) {
                const r = ( await Surveys.create(newForm)).toJSON();

                createdForms.push( r );
            }

            const existingUsers = ( await Users.findAll({ 
                where: { username: { [ Sequelize.Op.in ]: [ "paola.garita", "ignacio.acosta" ] } }
            })).map( r => r.toJSON() );

            for(const form of createdForms) {
                for(const user of [ ...createdUsers, ...existingUsers ] ) {
                    await interface.insert( 
                        null, 
                        "SurveyAccess", 
                        { userId: user.id, surveyId: form.id } 
                    );
                }
            }

            createdForms[ 0 ].questions = [
                {
                    label: 'Nombre del centro de salud',
                    type: 'TEXT',
                    required: true,
                    order: 0,
                    surveyid: createdForms[ 0 ].id
                },
                {
                    label: 'Nombre del HCP',
                    type: 'TEXT',
                    required: true,
                    order: 1,
                    surveyid: createdForms[ 0 ].id
                },
                {
                    label: 'Especialidad',
                    type: 'SINGLE_OPTION',
                    required: true,
                    order: 2,
                    surveyid: createdForms[ 0 ].id
                },
                {
                    label: 'Teléfono de contacto',
                    type: 'TEXT',
                    required: true,
                    order: 3,
                    surveyid: createdForms[ 0 ].id
                },
                {
                    label: 'Objetivo de la visita',
                    type: 'TEXT',
                    required: true,
                    order: 4,
                    surveyid: createdForms[ 0 ].id
                },
                {
                    label: 'Resultado de la visita',
                    type: 'TEXT',
                    required: true,
                    order: 5,
                    surveyid: createdForms[ 0 ].id
                },
                {
                    label: 'Se recomienda alguna marca?',
                    type: 'TEXT',
                    required: true,
                    order: 6,
                    surveyid: createdForms[ 0 ].id
                }
            ];

            createdForms[ 1 ].questions = [
                {
                    label: 'Nombre de la farmacia',
                    type: "TEXT",
                    required: true,
                    order: 0,
                    surveyid: createdForms[ 1 ].id
                },
                {
                    label: 'Objetivo de la visita',
                    type: "TEXT",
                    required: true,
                    order: 1,
                    surveyid: createdForms[ 1 ].id
                },
                {
                    label: 'Resultado de la visita',
                    type: "TEXT",
                    required: true,
                    order: 2,
                    surveyid: createdForms[ 1 ].id
                },
                {
                    label: 'Hallazgos',
                    type: "TEXT",
                    required: true,
                    order: 3,
                    surveyid: createdForms[ 1 ].id
                }
            ];

            const createdQuestions = [];
            
            for(const { questions } of createdForms) {
                for(const question of questions) {
                    const q = ( await Questions.create(question) ).toJSON();
                    createdQuestions.push( q );
                }
            }

            const specialtiesQuestion = createdQuestions.find( cq => (
                cq.label === "Especialidad" &&
                cq.surveyid === createdForms.find( cf => cf.title === "Nuevo Form 1" ).id
            ));

            const specialtyOptions = [
                {
                    label: 'Médico general',
                    value: 'Medico general',
                    questionid: specialtiesQuestion.id
                },
                {
                    label: 'Nutricionista',
                    value: 'Nutricionista',
                    questionid: specialtiesQuestion.id
                }
            ];

            for(const option of specialtyOptions) {
                await Options.create( option );
            }
        } catch ( e ) {
            console.error( "❌", e );
            console.info( "Exiting" );

            console.info( "You should execute rollback" );
        }
    },

    async down( interface, Sequelize ) {
        const surveyWithOptions = ( await Surveys.findAll( { where: { 
            title: "Nuevo Form 1"
        } } ) ).map( r => r.toJSON() ).at( -1 );
        const questionWithOptions = ( await Questions.findAll( { where: {
            surveyid: surveyWithOptions.id,
            label: "Especialidad"
        } } ) ).map( r => r.toJSON()).at( -1 );

        if( !surveyWithOptions ) return;
        
        const surveysToRemove = ( await Surveys.findAll( {
            where: { title: {
                [ Sequelize.Op.in ]: [ 'Nuevo Form 1', 'Nuevo Form 2' ]
            } }
        } ) ).map( v => v.toJSON() );
        const surveyIdsToRemove = surveysToRemove.map( s => s.id );

        await interface.bulkDelete( "SurveyAccess", { } );
        await interface.dropTable( "SurveyAccess" );
        
        await interface.bulkDelete( 
            "Users", 
            { username: { 
                [ Sequelize.Op.in ]: ['ana.bourne','ana.costarica'] 
            } }
        );
        await interface.bulkDelete( 
            "Survey", 
            { title: { 
                [ Sequelize.Op.in ]: ['Nuevo Form 1','Nuevo Form 2'] 
            } }
        );

        await interface.bulkDelete(
            "Question",
            { id: {
                [ Sequelize.Op.in ]: surveyIdsToRemove
            } }
        );

        await interface.bulkDelete(
            "Options",
            { questionid: questionWithOptions.id }
        );

        await interface.removeColumn( "Survey", "limitedAccess" );
    }
};
