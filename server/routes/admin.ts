import type { Express, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin } from "../auth";

export function registerAdminRoutes(app: Express) {
    // Stats
    app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req: any, res: Response) => {
        try {
            const stats = await storage.getAdminStats();
            res.json(stats);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch stats" });
        }
    });

    // List Users
    app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res: Response) => {
        try {
            const users = await storage.listUsers();
            res.json(users);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch users" });
        }
    });

    // Create User (Admin only)
    app.post("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res: Response) => {
        try {
            const { email, password, name, role } = req.body;

            const existing = await storage.getUserByEmail(email);
            if (existing) {
                return res.status(400).json({ message: "User already exists" });
            }

            // Fix: dynamically import hashPassword to avoid circular dependency issues if any,
            // or just rely on the export I just made.
            // Since I just exported it, I can import it.
            const { hashPassword } = await import("../auth");
            const hashedPassword = await hashPassword(password);
            const [firstName, ...rest] = name.split(" ");
            const lastName = rest.join(" ");

            const user = await storage.createUser({
                id: `user-${Date.now()}`,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role || 'patient',
                phoneNumber: "" // Optional
            } as any);

            // If patient, create profile
            if (role === 'patient') {
                await storage.createPatient({
                    userId: user.id,
                    contactNumber: "",
                    dateOfBirth: "",
                    gender: "",
                    address: "",
                    medicalHistory: ""
                } as any);
            }
            // If doctor, create profile
            else if (role === 'doctor') {
                await storage.createDoctor({
                    userId: user.id,
                    specialization: "General",
                    experienceYears: 0,
                    consultationFee: 0,
                    availability: "",
                    biography: ""
                } as any);
            }

            res.status(201).json(user);
        } catch (err: any) {
            res.status(500).json({ message: err.message || "Failed to create user" });
        }
    });
    // Update User Role (Admin only)
    app.patch("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req: any, res: Response) => {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (!["patient", "doctor", "admin", "receptionist"].includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }

            const updatedUser = await storage.updateUser(id, { role });
            res.json(updatedUser);
        } catch (err: any) {
            res.status(500).json({ message: err.message || "Failed to update role" });
        }
    });
}
