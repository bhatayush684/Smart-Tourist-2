const { Sequelize } = require('sequelize');

// PostgreSQL connection configuration
const sequelize = new Sequelize({
  database: 'tourist_safety_platform',
  username: 'postgres',
  password: '123456',
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: console.log, // Set to false in production
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error);
    return false;
  }
};

module.exports = { sequelize, testConnection };
