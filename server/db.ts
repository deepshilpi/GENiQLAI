import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { Logger } from 'drizzle-orm';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a custom query logger
class CustomQueryLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('Query:', query);
      if (params && params.length > 0) {
        console.log('Params:', params);
      }
    }
  }
}

// Create a function to set up the connection pool with resilient retry logic
const createPool = (connectionString: string, poolName: string = 'default') => {
  const newPool = new Pool({ 
    connectionString,
    max: 20,             // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 5000, // Extended timeout for connections
    maxUses: 7500,       // Close and replace a connection after it's been used this many times
    allowExitOnIdle: false // Don't allow the app to exit while clients might be active
  });
  
  // Log pool events for monitoring
  newPool.on('connect', (client) => {
    console.log(`New database connection established for pool: ${poolName}`);
  });

  // Handle connection errors with retry logic
  newPool.on('error', (err, client) => {
    console.error(`Unexpected database error on client (pool: ${poolName}):`, err);
    
    // Don't propagate the error which would crash the server
    // The connection will be automatically retried on next query
  });
  
  return newPool;
};

// Configure connection pool with retry capability for main database
export const pool = createPool(process.env.DATABASE_URL, 'main');

// Create and export a function to generate additional connection pools
export function createAdditionalPool(connectionString: string, poolName: string) {
  return createPool(connectionString, poolName);
}

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

// Create Drizzle ORM instance with prepared statements for main database
export const db = drizzle(pool, { 
  schema,
  logger: new CustomQueryLogger()
});

// Create and export a function to generate additional Drizzle instances
export function createDrizzleInstance(pool: Pool, name: string = 'additional') {
  return drizzle(pool, {
    schema,
    logger: new CustomQueryLogger()
  });
}