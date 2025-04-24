import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Increase server timeouts for expert-level analysis (3 minutes)
app.use((req, res, next) => {
  // Only increase timeouts for analysis and related endpoints
  if (req.path.includes('/api/analyze') || 
      req.path.includes('/api/execution-plan') || 
      req.path.includes('/api/budget-analysis') || 
      req.path.includes('/api/investors')) {
    // Set long timeouts for AI-powered analysis endpoints
    req.setTimeout(180000); // 3 minutes
    res.setTimeout(180000); // 3 minutes
    console.log(`Extended timeout set for ${req.path}`);
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Always use port 5000 for compatibility with Replit workflows
  const PORT = 5000;
  
  // Try to start the server on the specified port
  try {
    log(`Attempting to start server on port ${PORT}`);
    
    // Add a more resilient error recovery mechanism
    let retryCount = 0;
    const maxRetries = 3;
    
    // Set server timeout to 5 minutes for long-running analysis
    server.timeout = 300000; // 5 minutes

    // Simple approach: Just try to listen directly on the specified port
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server successfully started and listening on port ${PORT}`);
    });
    
    // Handle errors
    server.on('error', (e: any) => {
      console.error('Server error:', e);
      // Just exit with an error code so workflow will restart
      if (e.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please free up port ${PORT} and try again.`);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();