const sequelize = require('@root/sequelize');
const Survey = require('@models/survey');
const Question = require('@models/question');
const Option = require('@models/option');
const Submission = require('@models/submission');
const Answer = require('@models/answer');
const User = require('@models/user');
const SurveyAccess = require('@models/surveyAccess');
require("@models/visit");
const config = require( "@root/config" );
const { checkMandatoryData, insertInitialData } = require( "@models/initialSetup" );


Question.belongsTo( Survey, { foreignKey: "surveyid" } );
Survey.hasMany( Question, { foreignKey: "surveyid" } );

Option.belongsTo( Question, { foreignKey: "questionid" } );
Question.hasMany( Option, { foreignKey: "questionid" } );

Submission.belongsTo( Survey, { foreignKey: "surveyid" } );
Survey.hasMany( Submission, { foreignKey: "surveyid" } );

Submission.belongsTo( User, { foreignKey: "userid" } );
User.hasMany( Submission, { foreignKey: "userid" } );

Answer.belongsTo( Submission, { foreignKey: "submissionid" } );
Submission.hasMany( Answer, { foreignKey: "submissionid" } );

Answer.belongsTo( Question, { foreignKey: "questionid" } );
Question.hasMany( Answer, { foreignKey: "questionid" } );

Survey.hasMany(SurveyAccess, { foreignKey: 'surveyId' });
SurveyAccess.belongsTo(Survey, { foreignKey: 'surveyId' });

User.hasMany(SurveyAccess, { foreignKey: 'userId' });
SurveyAccess.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(Survey, {
    through: SurveyAccess,
    foreignKey: "userId",
    otherKey: "surveyId",
    as: "surveys"
});

Survey.belongsToMany(User, {
    through: SurveyAccess,
    foreignKey: "surveyId",
    otherKey: "userId",
    as: "users"
});

// Sync all models
async function syncDatabase() {
    await sequelize.authenticate();
    console.log('🟢 Connected to database');

    if( config.environment === "development" ) {
        //  WARNING: These options are destructive
        //  Possible options: { alter?: true, force?: true }
        const options = { force: false };

        await sequelize.sync( options );
        
        console.log('🔃 Database synced successfully');

        if( options?.force )
            console.warn( '⚠️  Database structure was forced to sync' );
    }

    if( !( await checkMandatoryData( ) ) ) {
        await insertInitialData( );
    }
}

module.exports = { sequelize, syncDatabase };
