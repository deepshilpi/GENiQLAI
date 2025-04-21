import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for NeonDB
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a simple database connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

// Log pool events for monitoring
pool.on('connect', () => {
  console.log('New database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema });