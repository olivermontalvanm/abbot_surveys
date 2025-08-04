"use strict";

const { DataTypes } = require( "sequelize" );
const sequelize = require( "@root/sequelize" );

const Submission = sequelize.define( "Submission", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ipaddress: { type: DataTypes.STRING, allowNull: true }
}, { tableName: "Submission", timestamps: true } );

module.exports = Submission;
