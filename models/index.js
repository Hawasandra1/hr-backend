'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../config/config.js')[env];
const db = {};  // <-- this was missing

let sequelize;

// Enhanced connection setup
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    retry: {
      max: 3, // Retry failed connections
    }
  });
}

// Load all models
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Set up model associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Enhanced connection testing
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
    console.log(`Database: ${config.database} on ${config.host}:${config.port || ''}`);
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err.message);
    if (env === 'development') {
      console.error('Full error:', err);
    }
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
