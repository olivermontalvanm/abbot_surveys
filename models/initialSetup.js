"use strict";

const Survey = require('@models/survey');
const Question = require('@models/question');
const Option = require('@models/option');
const User = require("@models/user");

async function checkMandatoryData( ) {
    const surveys = await Survey.count( );

    if( surveys < 2 ) {
        return false;
    }
    
    return true;
};

async function insertInitialData( ) {
    console.info( "✏️ Inserting initial data" );
    
    await Survey.destroy( { where: {} } );

    await User.destroy( { where: {} } );

    const users = [
        { country: "Guatemala", username: "damaris.ayala", password: "Guatemala.123", role: "user" },
        { country: "Costa Rica", username: "maria.zuniga", password: "CostaRica.123", role: "user" },
        { country: "Panama", username: "evilyn.cedeno", password: "Panama.123", role: "user" },
        { country: "El Salvador", username: "edwin.santillana", password: "ElSalvador.123", role: "user" },

        { username: "ignacio.acosta", password: "Admin.2025", role: "admin" },
        { username: "paola.garita", password: "admin.2025", role: "admin" },
        { username: "byan.urena", password: "admin.2025", role: "admin" },
    ];

    for( const user of users ) {
        await User.create( user );
    }

    const surveyTitles = [ "Centros de Salud", "HCP" ];
    const surveys = [];

    for( const surveyTitle of surveyTitles )
        surveys.push( ( await Survey.create( { title: surveyTitle } ) ).toJSON( ) );

    const questionSettings = [
        [
            { label: "País", type: "TEXT", visible: false },
            { label: "Nombre del hospital", type: "TEXT" },
            { label: "Área", type: "SINGLE_OPTION" },
            { label: "Jefe de enfermería", type: "TEXT" },
            { label: "Jefe de turno", type: "TEXT" },
            { label: "Número de camas", type: "NUMBER" },
            { label: "Número de bombas", type: "NUMBER" },
            { label: "Marca de bombas", type: "TEXT" },
            { label: "Sistema de gravedad", type: "SINGLE_OPTION" },
            { label: "Tiempo de alimentación en horas", type: "NUMBER" },
            { label: "Porcentaje de pacientes enterales", type: "NUMBER" },
            { label: "Porcentaje de pacientes parenterales", type: "NUMBER" },
            { label: "Porcentaje de pacientes suplementación", type: "NUMBER" },
        ],
        [
            { label: "País", type: "TEXT", visible: false },
            { label: "Servicio", type: "SINGLE_OPTION" },
            { label: "Hospital", type: "TEXT" },
            { label: "Nombre", type: "TEXT" },
            { label: "Apellidos", type: "TEXT" },
            { label: "Correo electrónico", type: "TEXT" },
            { label: "Teléfono", type: "TEXT" },
            { label: "Número de visitas del mes", type: "NUMBER", minvalue: 1, maxvalue: 3 },
        ]
    ];
    const questions = [];

    let ix = 0;
    for( const set of questionSettings ) {
        let iy = 0;
        for( const questionSetting of set ) {
            questions.push( ( await Question.create( {
                label: questionSetting.label,
                type: questionSetting.type,
                visible: questionSetting.visible ?? true,
                surveyid: surveys[ ix ].id,
                minvalue: questionSetting.minvalue ?? null,
                maxvalue: questionSetting.maxvalue ?? null,
                required: true,
                order: iy++
            } ) ).toJSON( ) );
        }
        ix++;
    }

    for( const areaOption of [ "UCI", "CIRUGIA", "MEDICINA INTERNA" ] ) {
        await Option.create( {
            label: areaOption, value: areaOption,
            questionid: questions.find( q => q.label == "Área" && q.type == "SINGLE_OPTION" ).id
        } );
    }

    for( const areaOption of [ "SI", "NO" ] ) {
        await Option.create( {
            label: areaOption, value: areaOption,
            questionid: questions.find( q => q.label == "Sistema de gravedad" && q.type == "SINGLE_OPTION" ).id
        } );
    }

    for( const areaOption of [ "UCI", "CIRUGIA", "MEDICINA INTERNA" ] ) {
        await Option.create( {
            label: areaOption, value: areaOption,
            questionid: questions.find( q => q.label == "Servicio" && q.type == "SINGLE_OPTION" ).id
        } );
    }
}

module.exports = { checkMandatoryData, insertInitialData }
