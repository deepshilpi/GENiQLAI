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

// Maximum number of reconnection attempts
const MAX_RECONNECT_ATTEMPTS = 5;
// Delay between reconnection attempts (in ms)
const RECONNECT_DELAY = 3000;
// Flag to track if we're in the process of reconnecting
let isReconnecting = false;
// Current reconnection attempt count
let reconnectAttempts = 0;

// Function to create a pool with reconnection capabilities
function createPool() {
  const newPool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 5, // Limit maximum connections
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // Consider connection timeout after 5 seconds
  });

  // Log pool events for monitoring
  newPool.on('connect', () => {
    console.log('New database connection established');
    // Reset reconnection counter on successful connection
    reconnectAttempts = 0;
    isReconnecting = false;
  });

  newPool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    
    // Only attempt reconnection if we're not already trying
    if (!isReconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      isReconnecting = true;
      reconnectAttempts++;
      
      console.log(`Database connection failed. Attempting reconnection ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${RECONNECT_DELAY}ms...`);
      
      // Close the current pool
      newPool.end().catch(err => console.error('Error closing pool:', err));
      
      // Schedule reconnection
      setTimeout(() => {
        try {
          // Replace the global pool with a new instance
          pool = createPool();
          // Update the drizzle instance with the new pool
          db = drizzle(pool, { schema });
          console.log('Reconnection attempt complete, new pool created');
        } catch (error) {
          console.error('Failed to create new pool during reconnection:', error);
          isReconnecting = false; // Allow future reconnection attempts
        }
      }, RECONNECT_DELAY);
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Please check your database configuration.`);
    }
  });

  return newPool;
}

// Create the initial pool
export let pool = createPool();

// Create Drizzle ORM instance
export let db = drizzle(pool, { schema });