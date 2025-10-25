const mysql = require("mysql2/promise");

// Only create pool if database configuration is available
let pool = null;

const createPool = () => {
  if (!pool && process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
      // Removed all potentially invalid options to eliminate warnings:
      // - acquireTimeout, timeout, reconnect (causing warnings)
      // - maxIdle, idleTimeout, enableKeepAlive (may not be supported)
      // Using only basic, well-documented MySQL2 pool options
    });
  }
  return pool;
};

// Test the database connection
const testConnection = async () => {
  try {
    // Only test connection if all required env vars are present
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      return false;
    }
    
    const dbPool = createPool();
    if (!dbPool) {
      return false;
    }
    
    const connection = await dbPool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("Error:", error.message);
    console.error("Please check your database configuration in .env file");
    return false;
  }
};

// Test connection when module is loaded (only in non-build environment)
if (process.env.NODE_ENV !== 'build' && process.env.NODE_ENV !== 'production') {
  testConnection();
}

// Export a function that returns the pool
module.exports = createPool();
