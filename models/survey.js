"use strict";

const { DataTypes } = require( "sequelize" );
const sequelize = require( "@root/sequelize" );

const Survey = sequelize.define( "Survey", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    opened: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    limitedAccess: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: "Survey", timestamps: true } );

module.exports = Survey;
