import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a function to set up the connection pool with resilient retry logic
const createPool = () => {
  const newPool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 20,             // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 5000, // Extended timeout for connections
    maxUses: 7500,       // Close and replace a connection after it's been used this many times
    allowExitOnIdle: false // Don't allow the app to exit while clients might be active
  });
  
  // Log pool events for monitoring
  newPool.on('connect', (client) => {
    console.log('New database connection established');
  });

  // Handle connection errors with retry logic
  newPool.on('error', (err, client) => {
    console.error('Unexpected database error on client:', err);
    
    // Don't propagate the error which would crash the server
    // The connection will be automatically retried on next query
  });
  
  return newPool;
};

// Configure connection pool with retry capability
export const pool = createPool();

// Test the connection and retry on startup if needed
(async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      const client = await pool.connect();
      console.log('Database connection verified on startup');
      client.release();
      break;
    } catch (err) {
      console.error(`Database connection failed, retries left: ${retries}`, err);
      retries--;
      if (retries === 0) {
        console.error('Unable to connect to database after maximum retries');
        // Don't crash the server - other functionality can still work
        // and the database might come back online later
      } else {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
})();

// Create Drizzle ORM instance with prepared statements
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV === 'development' // Enable query logging in development
});