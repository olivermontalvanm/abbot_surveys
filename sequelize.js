const { Sequelize } = require( "sequelize" );
const config = require( "./config" );

const sequelize = new Sequelize( config.sqlConfig.database, config.sqlConfig.user, config.sqlConfig.password, {
    host: config.sqlConfig.server,
    dialect: "mysql",
    pool: {
        max: 10,
        min: 1,
        acquire: 3000,
        idle: 10000
    },
    logging: false
} );

module.exports = sequelize;
