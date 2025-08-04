"use strict";

const { DataTypes } = require( "sequelize" );
const sequelize = require( "@root/sequelize" );

const Users = sequelize.define( "Users", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    country: { type: DataTypes.STRING, allowNull: true },
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: true }
}, { tableName: "Users", timestamps: true } );

module.exports = Users;
