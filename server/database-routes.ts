import { Express } from 'express';
import { dbManager } from './db-manager';
import { pool } from './db';

export function setupDatabaseRoutes(app: Express) {
  // Route to check the status of the default database
  app.get('/api/database/status', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const client = await pool.connect();
      
      // Run a simple query to check if the database is working
      const result = await client.query('SELECT NOW() as time');
      client.release();
      
      return res.status(200).json({
        status: 'connected',
        time: result.rows[0].time,
        message: 'Default database connection is healthy'
      });
    } catch (error: any) {
      console.error('Database status check failed:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to connect to default database',
        error: error?.message || 'Unknown error'
      });
    }
  });

  // Route to connect to a new database
  app.post('/api/database/connect', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { connectionString, name } = req.body;
    
    if (!connectionString || !name) {
      return res.status(400).json({ 
        message: "Connection string and database name are required" 
      });
    }
    
    try {
      // Connect to the database
      const db = dbManager.connect(connectionString, name);
      
      // Test the connection with a simple query
      const result = await db.execute(
        `SELECT NOW() as time`
      );
      
      return res.status(200).json({
        status: 'connected',
        name,
        time: result[0].time,
        message: `Successfully connected to database: ${name}`
      });
    } catch (error: any) {
      console.error(`Failed to connect to database ${name}:`, error);
      return res.status(500).json({
        status: 'error',
        message: `Failed to connect to database: ${name}`,
        error: error?.message || 'Unknown error'
      });
    }
  });
  
  // Route to list all active database connections
  app.get('/api/database/connections', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const connections = dbManager.listConnections();
      
      return res.status(200).json({
        connections,
        count: connections.length,
        message: 'Active database connections'
      });
    } catch (error: any) {
      console.error('Error listing database connections:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to list database connections',
        error: error?.message || 'Unknown error'
      });
    }
  });
  
  // Route to close a specific database connection
  app.delete('/api/database/connections/:name', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { name } = req.params;
    
    if (!name) {
      return res.status(400).json({ message: "Database name is required" });
    }
    
    try {
      // Check if connection exists
      const connection = dbManager.getConnection(name);
      
      if (!connection) {
        return res.status(404).json({
          status: 'not_found',
          message: `Database connection not found: ${name}`
        });
      }
      
      // Close the connection
      await dbManager.closeConnection(name);
      
      return res.status(200).json({
        status: 'success',
        message: `Database connection closed: ${name}`
      });
    } catch (error: any) {
      console.error(`Error closing database connection ${name}:`, error);
      return res.status(500).json({
        status: 'error',
        message: `Failed to close database connection: ${name}`,
        error: error?.message || 'Unknown error'
      });
    }
  });
}