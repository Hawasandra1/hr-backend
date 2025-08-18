'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

let sequelize;

// ✅ Use DATABASE_URL on Render (production)
if (env === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // ✅ Local dev (MySQL)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'hr_db_dev',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || null,
    {
      host: process.env.DB_HOST || '127.0.0.1',
      dialect: 'mysql',
    }
  );
}

// Load all models in the folder
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Test DB connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
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
