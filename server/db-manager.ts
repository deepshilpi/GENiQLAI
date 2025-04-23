import { Pool } from '@neondatabase/serverless';
import { createAdditionalPool, createDrizzleInstance } from './db';
import * as schema from '@shared/schema';

// Class to manage secondary database connections
export class DatabaseManager {
  private static instance: DatabaseManager;
  private connections: Map<string, { pool: Pool, db: any }> = new Map();
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }
  
  /**
   * Connect to a secondary database
   * @param connectionString The database connection string
   * @param name A unique name for this database connection
   * @returns The Drizzle ORM instance for this connection
   */
  public connect(connectionString: string, name: string) {
    if (this.connections.has(name)) {
      console.log(`Returning existing database connection: ${name}`);
      return this.connections.get(name)!.db;
    }
    
    try {
      // Create a new connection pool
      const pool = createAdditionalPool(connectionString, name);
      
      // Create a new Drizzle instance
      const db = createDrizzleInstance(pool, name);
      
      // Store both the pool and db instance
      this.connections.set(name, { pool, db });
      
      console.log(`Successfully connected to database: ${name}`);
      return db;
    } catch (error: any) {
      console.error(`Failed to connect to database ${name}:`, error);
      throw new Error(`Failed to connect to database ${name}: ${error?.message || 'Unknown error'}`);
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
  public async closeConnection(name: string) {
    const connection = this.connections.get(name);
    
    if (connection) {
      try {
        await connection.pool.end();
        this.connections.delete(name);
        console.log(`Closed database connection: ${name}`);
      } catch (error: any) {
        console.error(`Error closing database connection ${name}:`, error);
      }
    }
  }
  
  /**
   * Close all database connections
   */
  public async closeAllConnections() {
    const connectionNames = Array.from(this.connections.keys());
    
    for (const name of connectionNames) {
      await this.closeConnection(name);
    }
    
    console.log('All secondary database connections closed');
  }
  
  /**
   * List all active database connections
   * @returns Array of connection names
   */
  public listConnections() {
    return Array.from(this.connections.keys());
  }
}

// Export a singleton instance
export const dbManager = DatabaseManager.getInstance();