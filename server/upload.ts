import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import type { Express, Request, Response } from "express";
import { isAuthenticated } from "./auth";
import { storage } from "./storage";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config: store in memory (for streaming to Cloudinary)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (_req, file, cb) => {
        const allowed = [
            "image/jpeg", "image/png", "image/webp", "image/gif",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} not allowed`));
        }
    },
});

export function registerUploadRoutes(app: Express): void {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        console.warn("⚠️  Cloudinary credentials missing — file uploads disabled");
        return;
    }

    // POST /api/upload — upload a file to Cloudinary and save metadata
    app.post(
        "/api/upload",
        isAuthenticated,
        upload.single("file"),
        async (req: Request, res: Response) => {
            try {
                const file = req.file;
                if (!file) {
                    return res.status(400).json({ message: "No file provided" });
                }

                const { patientId, category, description } = req.body;
                if (!patientId) {
                    return res.status(400).json({ message: "patientId is required" });
                }

                // Upload buffer to Cloudinary
                const result = await new Promise<any>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: `clinic/${patientId}`,
                            resource_type: "auto",
                            public_id: `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`,
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(file.buffer);
                });

                // Save metadata to DB
                const mediaFile = await storage.createMediaFile({
                    patientId,
                    publicId: result.public_id,
                    url: result.url,
                    secureUrl: result.secure_url,
                    resourceType: result.resource_type,
                    fileName: file.originalname,
                    fileType: result.format || file.mimetype.split("/")[1],
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    category: category || "other",
                    description: description || null,
                });

                res.status(201).json(mediaFile);
            } catch (error: any) {
                console.error("[Upload Error]", error);
                res.status(500).json({ message: error.message || "Upload failed" });
            }
        }
    );

    // GET /api/media-files — list uploaded files for a patient
    app.get("/api/media-files", isAuthenticated, async (req: Request, res: Response) => {
        try {
            const patientId = req.query.patientId as string | undefined;
            const files = patientId
                ? await storage.getMediaFilesForPatient(patientId)
                : [];
            res.json(files);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    console.log("📁 File upload routes registered (Cloudinary)");
}
