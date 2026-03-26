"use strict";

const { DataTypes } = require( "sequelize" );
const sequelize = require( "@root/sequelize" );
const User = require( "@models/user" );
const Survey = require( "@models/survey" );

const SurveyAccess = sequelize.define( "SurveyAccess", {
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" }, field: "userId" },
    surveyId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Survey, key: "id" }, field: "surveyId" },
}, { tableName: "SurveyAccess", timestamps: false } );

SurveyAccess.removeAttribute("id");

module.exports = SurveyAccess;
