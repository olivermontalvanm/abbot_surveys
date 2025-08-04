"use strict";

const { DataTypes } = require( "sequelize" );
const sequelize = require( "@root/sequelize" );

const Question = sequelize.define( "Question", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    label: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM( "TEXT", "SINGLE_OPTION", "NUMBER" ), allowNull: false, defaultValue: "TEXT" },
    minvalue: { type: DataTypes.INTEGER },
    maxvalue: { type: DataTypes.INTEGER },
    visible: { type: DataTypes.BOOLEAN, defaultValue: true },
    required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, { tableName: "Question", timestamps: true } );

module.exports = Question;
