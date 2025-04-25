import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import createMemoryStore from "memorystore";
import { User } from "@shared/schema";

// Type declarations for passport authentication
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      [key: string]: any;
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Initialize session store with PostgreSQL, falling back to memory store
  let sessionStore;
  const MemoryStore = createMemoryStore(session);

  try {
    // First try to use PostgreSQL session store
    const PostgresStore = connectPg(session);

    // Create with error handling
    sessionStore = new PostgresStore({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    });

    // Verify the connection works
    pool.query('SELECT NOW()', (err) => {
      if (err) {
        console.warn('PostgreSQL session store connection check failed:', err);
        throw new Error('PostgreSQL connection check failed');
      }
    });

    console.log('Using PostgreSQL session store');
  } catch (error) {
    // If PostgreSQL fails, fallback to memory store
    console.warn('PostgreSQL session store failed, falling back to memory store:', error);
    sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    console.log('Using in-memory session store');
  }

  // Configure cookie settings for Replit environment
  // We're using more permissive settings for Replit to ensure cookies work
  const cookieSettings: session.CookieOptions = {
    httpOnly: true,
    sameSite: 'lax', // Use 'lax' for better compatibility in Replit environment
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for better persistence
    secure: false, // Set to false for testing (works in Replit environment)
    path: '/' // Ensure cookie is available for all paths
  };

  // Log cookie settings for debugging
  console.log('Session cookie settings:', cookieSettings);

  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true, // Set to true to ensure session is saved on each request
    saveUninitialized: true, // Allow saving empty sessions (better for auth flows)
    rolling: true, // Reset cookie expiration on each request
    cookie: cookieSettings
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }

      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return done(null, false, { message: "Invalid username or password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user: Express.User, done: (err: Error | null, id?: number) => void) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done: (err: Error | null, user?: Express.User | false) => void) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error("User deserialization error:", error);
      done(error as Error);
    }
  });

  app.post("/api/register", async (req: Request, res: Response) => {
    console.log("POST /api/register - New registration attempt");
    
    // Add cache control headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    try {
      const { username, email, password } = req.body;
      console.log(`Registration request for username: ${username}, email: ${email}`);

      // Validate required fields
      if (!username || !email || !password) {
        console.log("Registration failed: Missing required fields");
        return res.status(400).json({ 
          message: "Username, email, and password are required" 
        });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        console.log(`Registration failed: Username ${username} already exists`);
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password and create user
      console.log("Hashing password and creating user");
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });
      console.log(`User created with ID: ${user.id}`);

      // Log the user in after successful registration
      console.log("Attempting automatic login after registration");
      req.login(user, (err: Error | null) => {
        if (err) {
          console.error("Login after registration failed:", err);
          return res.status(500).json({ 
            message: "Registration succeeded but automatic login failed. Please log in manually." 
          });
        }
        
        console.log(`Registration and login successful for ${username}, session ID: ${req.session?.id}`);
        
        // Return the user without the password
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        message: "Registration failed: " + (error instanceof Error ? error.message : "Unknown error") 
      });
    }
  });

  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /api/login - attempt with username:", req.body?.username);
    
    // Add cache control headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Validate required fields
    const { username, password } = req.body;
    if (!username || !password) {
      console.log("Login failed: Missing username or password");
      return res.status(400).json({ 
        message: "Username and password are required" 
      });
    }

    passport.authenticate("local", (err: Error | null, user: User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login error: " + err.message });
      }
      
      if (!user) {
        console.log("Login failed: Invalid credentials for username:", username);
        return res.status(401).json({ message: info?.message || "Invalid username or password" });
      }

      console.log("Credentials valid, creating session for user:", username);
      
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          console.error("Session login error:", loginErr);
          return res.status(500).json({ message: "Session creation failed" });
        }
        
        console.log("Login successful, session created with ID:", req.session?.id);
        
        // Return the user without the password
        const { password, ...userWithoutPassword } = user as any;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    // Add cache control headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const username = req.user ? (req.user as any).username : 'unknown';
    const sessionId = req.session?.id;
    
    console.log(`POST /api/logout - User: ${username}, Session ID: ${sessionId}`);
    
    if (!req.isAuthenticated()) {
      console.log("Logout requested but user not authenticated");
      return res.status(200).json({ message: "Already logged out" });
    }
    
    req.logout((err: Error | null) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed: " + err.message });
      }
      
      // Destroy the session after logout
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.warn("Session destruction error:", sessionErr);
        }
        
        console.log(`Logout successful for user: ${username}`);
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    // Add cache control headers to prevent browser caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    console.log("GET /api/user - isAuthenticated:", req.isAuthenticated(), "session ID:", req.session?.id);
    
    if (!req.isAuthenticated() || !req.user) {
      console.log("User not authenticated, returning 401");
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = req.user as any;
    console.log("Returning authenticated user:", userWithoutPassword.username);
    res.json(userWithoutPassword);
  });
}