const mysql = require("mysql2/promise");

// Only create pool if database configuration is available
let pool = null;
const SLOW_QUERY_MS = parseInt(process.env.SLOW_QUERY_MS || '500', 10);

const createPool = () => {
  if (!pool && process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        dateStrings: true,
        charset: 'utf8mb4',
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000, // 10 seconds
        connectTimeout: 10000, // 10 seconds timeout for initial connection
      });

      // Handle pool errors to prevent process crashes
      pool.on('error', (err) => {
        console.error('[DB_POOL_ERROR]', {
          code: err.code,
          message: err.message,
          fatal: err.fatal
        });
        
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET' || err.fatal) {
          console.warn('Database connection lost or fatal error. Resetting pool for next query.');
          pool = null; 
        }
      });

      // Wrap query to log slow queries and handle fatal errors
      const originalQuery = pool.query.bind(pool);
      pool.query = async (...args) => {
        const start = Date.now();
        try {
          const result = await originalQuery(...args);
          const duration = Date.now() - start;
          if (duration > SLOW_QUERY_MS) {
            const sql = typeof args[0] === 'string' ? args[0].replace(/\s+/g, ' ').trim() : '';
            console.warn(JSON.stringify({
              type: 'slow_query',
              duration_ms: duration,
              sql: sql.slice(0, 500)
            }));
          }
          return result;
        } catch (error) {
          console.error('[DB_QUERY_ERROR]', {
            code: error.code,
            message: error.message,
            sql: typeof args[0] === 'string' ? args[0].slice(0, 200) : 'N/A'
          });

          if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET' || error.fatal) {
            pool = null; // Reset pool on fatal error
          }
          throw error;
        }
      };
    } catch (err) {
      console.error('Failed to initialize database pool:', err.message);
      pool = null;
    }
  }
  return pool;
};

// Test the database connection
const testConnection = async () => {
  try {
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missing = requiredVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      console.error(`❌ Database configuration missing: ${missing.join(', ')}`);
      return false;
    }
    
    const dbPool = createPool();
    if (!dbPool) {
      console.error("❌ Failed to create database pool - check environment variables");
      return false;
    }
    
    const connection = await dbPool.getConnection();
    console.log("✅ Database connection successful");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", {
      message: error.message,
      code: error.code,
      host: process.env.DB_HOST
    });
    return false;
  }
};

// Test connection on startup (always log in production to help debug Vercel issues)
testConnection();

// Create a proxy object that checks if pool exists before calling methods
const dbProxy = new Proxy({}, {
  get(target, prop) {
    const currentPool = createPool();
    if (!currentPool) {
      const error = new Error('Database connection not available. Ensure DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME are set.');
      error.statusCode = 500;
      error.errorCode = 'DB_CONFIG_ERROR';
      throw error;
    }
    const value = currentPool[prop];
    return typeof value === 'function' ? value.bind(currentPool) : value;
  }
});

module.exports = dbProxy;

