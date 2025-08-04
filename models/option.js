"use strict";

const { DataTypes } = require( "sequelize" );
const sequelize = require( "@root/sequelize" );

const Options = sequelize.define( "Options", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    label: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.STRING, allowNull: false }
}, { tableName: "Options", timestamps: true } );

module.exports = Options;
