"use strict";

const { DataTypes } = require( "sequelize" );
const sequelize = require( "@root/sequelize" );

const Answer = sequelize.define( "Answer", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    value: { type: DataTypes.STRING, allowNull: false }
}, { tableName: "Answer", timestamps: true } );

module.exports = Answer;
