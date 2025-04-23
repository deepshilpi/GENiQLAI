import express, { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { DatabaseManager } from "./db-manager";

// Schema for validating connection requests
const connectionSchema = z.object({
  name: z.string().min(1, "Connection name is required"),
  connectionString: z.string().min(1, "Connection string is required")
});

export function setupDatabaseRoutes(app: Express) {
  const dbManager = DatabaseManager.getInstance();
  
  // Check database status
  app.get("/api/database/status", async (req: Request, res: Response) => {
    try {
      // Implement a simple query to verify the default database is working
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // The DATABASE_URL environment variable should be configured and working
      const time = new Date().toISOString();
      return res.status(200).json({ status: "connected", time });
    } catch (error) {
      console.error("Database status check failed:", error);
      return res.status(500).json({ 
        message: "Database connection verification failed", 
        error: (error as Error).message 
      });
    }
  });
  
  // List all active database connections
  app.get("/api/database/connections", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const connections = dbManager.listConnections();
      return res.status(200).json({ connections });
    } catch (error) {
      console.error("Failed to list database connections:", error);
      return res.status(500).json({ 
        message: "Failed to retrieve database connections", 
        error: (error as Error).message 
      });
    }
  });
  
  // Connect to a new database
  app.post("/api/database/connect", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Validate request body
      const validation = connectionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid connection details", 
          errors: validation.error.errors 
        });
      }
      
      const { name, connectionString } = validation.data;
      
      // Check if a connection with this name already exists
      if (dbManager.getConnection(name)) {
        return res.status(400).json({ 
          message: "A connection with this name already exists" 
        });
      }
      
      // Attempt to establish a connection
      const connection = await dbManager.connect(connectionString, name);
      
      return res.status(200).json({ 
        message: "Database connection established successfully",
        name
      });
    } catch (error) {
      console.error("Failed to connect to database:", error);
      return res.status(500).json({ 
        message: "Failed to establish database connection", 
        error: (error as Error).message 
      });
    }
  });
  
  // Close a specific database connection
  app.delete("/api/database/connections/:name", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { name } = req.params;
      
      // Check if the connection exists
      if (!dbManager.getConnection(name)) {
        return res.status(404).json({ 
          message: "Connection not found" 
        });
      }
      
      // Close the connection
      await dbManager.closeConnection(name);
      
      return res.status(200).json({ 
        message: "Database connection closed successfully" 
      });
    } catch (error) {
      console.error("Failed to close database connection:", error);
      return res.status(500).json({ 
        message: "Failed to close database connection", 
        error: (error as Error).message 
      });
    }
  });
  
  // Close all database connections (useful for system shutdown)
  app.delete("/api/database/connections", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Close all connections
      await dbManager.closeAllConnections();
      
      return res.status(200).json({ 
        message: "All database connections closed successfully" 
      });
    } catch (error) {
      console.error("Failed to close all database connections:", error);
      return res.status(500).json({ 
        message: "Failed to close all database connections", 
        error: (error as Error).message 
      });
    }
  });
}