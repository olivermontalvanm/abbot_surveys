"use strict";

const { DataTypes } = require( "sequelize" );
const sequelize = require( "@root/sequelize" );

const Visit = sequelize.define( "Visits", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.STRING, allowNull: false },
    time: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    lastnames: { type: DataTypes.STRING, allowNull: false },
    service: { type: DataTypes.STRING, allowNull: false },
    hospital: { type: DataTypes.STRING, allowNull: false },
    goal: { type: DataTypes.STRING, allowNull: false },
    brands: { type: DataTypes.STRING, allowNull: false },
    trainedHcps: { type: DataTypes.STRING, allowNull: false },
    activityDone: { type: DataTypes.STRING, allowNull: false },
    visitResult: { type: DataTypes.STRING, allowNull: false }
}, { tableName: "Visits", timestamps: true } );

module.exports = Visit;
