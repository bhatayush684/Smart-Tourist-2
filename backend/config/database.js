const { Sequelize } = require('sequelize');

// PostgreSQL connection configuration
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5001,
  database: process.env.DB_NAME || 'tourist_safety_platform',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
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
    console.error('❌ Unable to connect to PostgreSQL:', error.message);
    console.log('💡 Continuing without database for now...');
    return false;
  }
};

module.exports = { sequelize, testConnection };
