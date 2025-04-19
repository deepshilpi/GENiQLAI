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

// Configure connection pool with optimal settings 
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,             // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  maxUses: 7500        // Close and replace a connection after it's been used this many times
});

// Log pool events for monitoring
pool.on('connect', (client) => {
  console.log('New database connection established');
});

pool.on('error', (err, client) => {
  console.error('Unexpected database error on client:', err);
});

// Create Drizzle ORM instance with prepared statements
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV === 'development' // Enable query logging in development
});