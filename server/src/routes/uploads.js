// routes/uploads.js (or inside your existing router file)
import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";

const router = Router();

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase(); // .png .jpg ...
    const base = crypto.randomBytes(16).toString("hex");
    cb(null, `${base}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /image\/(png|jpe?g|webp|gif|svg\+xml)/i.test(file.mimetype);
  cb(ok ? null : new Error("Only image files are allowed"), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/uploads  (thanks to your Vite proxy `/api` -> 4000)
router.post("/uploads", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  // You do NOT insert DB here; just return URL. Client will send it in the register payload.
  res.json({ url });
});

export default router;
