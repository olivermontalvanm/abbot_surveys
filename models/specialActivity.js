"use strict";

const { DataTypes } = require( "sequelize" );
const sequelize = require( "@root/sequelize" );
const User = require( "@models/user" );

/**
 * NOTE: This model is intentionally NOT required from models/index.js.
 * Its table is created by seeders/special_activities_form.js (dev and prod alike),
 * so it must not be loaded before sequelize.sync( ) runs in development.
 */
const SpecialActivity = sequelize.define( "SpecialActivities", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
    date: { type: DataTypes.STRING, allowNull: false },
    time: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: false },
    hospital: { type: DataTypes.STRING, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
    topic: { type: DataTypes.TEXT, allowNull: false },
    attendees: { type: DataTypes.STRING, allowNull: false },
    comments: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: "SpecialActivities", timestamps: true } );

SpecialActivity.belongsTo( User, { foreignKey: "userId" } );
User.hasMany( SpecialActivity, { foreignKey: "userId" } );

module.exports = SpecialActivity;
