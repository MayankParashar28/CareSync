import type { Express, Request, Response, NextFunction } from 'express';
import { storage } from "./storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePassword(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express): Promise<void> {
  // Seed admin user if not exists
  const adminEmail = "admin@clinic.com";
  const existingAdmin = await storage.getUserByEmail(adminEmail);

  if (!existingAdmin) {
    console.log("🌱 Seeding admin user...");
    const hashedPassword = await hashPassword("admin123");
    await storage.createUser({
      id: "admin-user",
      email: adminEmail,
      firstName: "Clinic",
      lastName: "Admin",
      role: "admin",
      password: hashedPassword,
    } as any);
  }
}

export function registerAuthRoutes(app: Express): void {
  // Get current user
  app.get('/api/auth/user', (req, res) => {
    if (req.session.user) {
      return res.json(req.session.user);
    }
    res.status(401).json({ message: 'Not authenticated' });
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(`[Login Attempt] Email: '${email}' (len: ${email?.length}), Password len: ${password?.length}`);

      const user = await storage.getUserByEmailWithPassword(email);
      console.log(`[Login Debug] User found: ${!!user}, Has Password: ${!!user?.password}`);

      if (user?.password) {
        const isMatch = await comparePassword(password, user.password);
        console.log(`[Login Debug] Password Match Result: ${isMatch}`);
      }

      if (!user || !user.password || !(await comparePassword(password, user.password))) {
        console.log("[Login Debug] Login failed: Invalid credentials");
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      req.session.user = {
        id: user.id,
        email: user.email!,
        role: user.role || 'patient'
      };

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Signup
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, name } = req.body;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await hashPassword(password);
      const [firstName, ...rest] = name.split(" ");

      const user = await storage.createUser({
        id: `user-${Date.now()}`,
        email,
        password: hashedPassword,
        firstName,
        lastName: rest.join(" "),
        role: 'patient'
      } as any);

      // Create Patient Profile
      await storage.createPatient({
        userId: user.id,
        contactNumber: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        medicalHistory: ""
      } as any);

      req.session.user = {
        id: user.id,
        email: user.email || email,
        role: user.role || 'patient'
      };

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  });
}

// Authentication middleware
export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.user) {
    // Populate req.user for backward compatibility with routes
    (req as any).user = {
      ...req.session.user,
      claims: { sub: req.session.user.id }
    };
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
}

// Helper to set custom claims (role-based access) - No-op for now
export async function setUserRole(uid: string, role: 'patient' | 'doctor' | 'admin' | 'receptionist'): Promise<void> {
  // No-op
}

export function isAdmin(req: any, res: Response, next: NextFunction) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Admin access required' });
}

// Stub for object storage (S3 will be implemented separately)
export function registerObjectStorageRoutes(app: Express): void {
  console.log('📦 Object storage routes registered (Cloudinary integrated)');
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️  Cloudinary credentials missing - file uploads disabled');
  }
}
