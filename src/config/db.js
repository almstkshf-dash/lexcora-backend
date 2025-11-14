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
      queueLimit: 0,
      dateStrings: true,
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    });
  }
  return pool;
};

// Test the database connection
const testConnection = async () => {
  try {
    // Only test connection if all required env vars are present
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      console.error("❌ Database configuration missing in .env file");
      return false;
    }
    
    const dbPool = createPool();
    if (!dbPool) {
      console.error("❌ Failed to create database pool");
      return false;
    }
    
    const connection = await dbPool.getConnection();
    console.log("✅ Database connection successful");
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

// Create a proxy object that checks if pool exists before calling methods
const dbProxy = new Proxy({}, {
  get(target, prop) {
    const currentPool = createPool();
    if (!currentPool) {
      throw new Error('Database connection not available. Please check your database configuration.');
    }
    return currentPool[prop];
  }
});

// Export the proxy instead of the raw pool
module.exports = dbProxy;
