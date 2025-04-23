import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';

// Configure neon for WebSocket
(async () => {
  try {
    const { neonConfig } = await import('@neondatabase/serverless');
    neonConfig.webSocketConstructor = ws;
  } catch (error) {
    console.error('Failed to configure neon WebSocket:', error);
  }
})();

/**
 * DatabaseManager is a singleton class that manages multiple database connections.
 * It allows connecting to different PostgreSQL databases at runtime and provides
 * methods to access these connections.
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private connections: Map<string, { pool: Pool, db: any }> = new Map();

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  /**
   * Get the singleton instance of DatabaseManager
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Connect to a database and create a Drizzle ORM instance for it
   * @param connectionString PostgreSQL connection string
   * @param name Unique identifier for this connection
   * @returns The Drizzle ORM instance
   */
  public async connect(connectionString: string, name: string) {
    try {
      // Create a new pool for this connection
      const pool = new Pool({ connectionString });
      
      // Test the connection by running a basic query
      await pool.query('SELECT 1');
      
      // Create a Drizzle instance
      const db = drizzle(pool, { schema });
      
      // Store both the pool and db instance
      this.connections.set(name, { pool, db });
      
      console.log(`Database connection established: ${name}`);
      return db;
    } catch (error) {
      console.error(`Failed to establish database connection ${name}:`, error);
      throw new Error(`Database connection failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get an existing database connection by name
   * @param name The unique name for this database connection
   * @returns The Drizzle ORM instance or undefined if not found
   */
  public getConnection(name: string) {
    const connection = this.connections.get(name);
    return connection ? connection.db : undefined;
  }

  /**
   * Close a specific database connection
   * @param name The unique name for this database connection
   */
  public async closeConnection(name: string): Promise<void> {
    const connection = this.connections.get(name);
    if (connection) {
      try {
        await connection.pool.end();
        this.connections.delete(name);
        console.log(`Database connection closed: ${name}`);
      } catch (error) {
        console.error(`Error closing database connection ${name}:`, error);
        throw new Error(`Failed to close database connection: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Close all database connections
   */
  public async closeAllConnections(): Promise<void> {
    try {
      const promises = Array.from(this.connections.entries()).map(async ([name, connection]) => {
        await connection.pool.end();
        console.log(`Database connection closed: ${name}`);
      });
      
      await Promise.all(promises);
      this.connections.clear();
    } catch (error) {
      console.error('Error closing all database connections:', error);
      throw new Error(`Failed to close all database connections: ${(error as Error).message}`);
    }
  }

  /**
   * List all active database connections
   * @returns Array of connection names
   */
  public listConnections(): string[] {
    return Array.from(this.connections.keys());
  }
}

// Export a singleton instance
export const dbManager = DatabaseManager.getInstance();