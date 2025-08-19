module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "hr_db_dev",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql"
  },

  test: {
    username: "root",
    password: "",
    database: "hr_db_test",
    host: "localhost",
    dialect: "mysql"
  },

  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
