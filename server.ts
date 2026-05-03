import express from "express";
import { createServer as createViteServer } from "vite";
import path from "node:path";
import multer from "multer";
import Tesseract from "tesseract.js";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import cors from "cors";
import OpenAI from "openai";
import fs from "node:fs/promises";

console.log("Starting server initialization...");

// Local Data Store (replacing unreachable Firebase for this demo)
const DATA_DIR = path.join(process.cwd(), "data");
const NOTICES_FILE = path.join(DATA_DIR, "notices.json");
const NOTIFICATIONS_FILE = path.join(DATA_DIR, "notifications.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    // Initialize files if they don't exist
    for (const file of [NOTICES_FILE, NOTIFICATIONS_FILE]) {
      try {
        await fs.access(file);
      } catch {
        await fs.writeFile(file, JSON.stringify([]));
      }
    }
  } catch (e) {
    console.error("Failed to create data directory", e);
  }
}

const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// AI Initialization
const getNimClient = () => {
  if (process.env.NIM_API_KEY) {
    return new OpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: process.env.NIM_API_KEY
    });
  }
  return null;
};

// --- AUTH VALIDATION HELPERS ---
const isValidAadhaar = (aadhaar: string) => {
  const clean = aadhaar.replace(/\s/g, '');
  return /^\d{12}$/.test(clean);
};

const isValidPassword = (pass: string) => {
  const complexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return complexity.test(pass);
};

// --- API ROUTES ---

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: "local-persistent" });
});

// Authentication Endpoints
app.post("/api/auth/register", async (req, res) => {
  const { fullname, aadhaar, username, email, password } = req.body;
  
  if (!fullname || !aadhaar || !username || !email || !password) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  if (!isValidAadhaar(aadhaar)) {
    return res.status(400).json({ success: false, error: "Invalid Aadhaar: Must be 12 numeric digits" });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ success: false, error: "Password does not meet security requirements" });
  }

  console.log(`[AUTH] Registering Citizen: ${fullname} (Aadhaar: ${aadhaar.slice(-4)}xxxx)`);
  // In a real app, we would hash password and save to DB
  res.json({ success: true, message: "Registration successful. Verification pending." });
});

app.post("/api/auth/login", async (req, res) => {
  const { identifier, password } = req.body; // identifier can be username or email
  console.log(`[AUTH] Login attempt for: ${identifier}`);
  
  // Simulation: Admin check
  if (identifier === "admin@gov.in" && password === "Admin@123") {
    return res.json({ 
      success: true, 
      user: { id: "admin_1", name: "Government Admin", role: "ADMIN", email: identifier } 
    });
  }

  // Simulation: Success for demo
  res.json({ 
    success: true, 
    user: { id: "user_" + Date.now(), name: "Verified Citizen", role: "USER", email: identifier } 
  });
});

// New OCR Endpoint
app.post("/api/ocr", upload.single("file"), async (req: any, res: any) => {
  try {
    let extractedText = "";
    if (req.file) {
      console.log(`Processing file: ${req.file.originalname} (${req.file.mimetype})`);
      if (req.file.mimetype === "application/pdf") {
        try {
          const data = await pdf(req.file.buffer);
          extractedText = data.text;
        } catch (e) {
          console.error("PDF Parsing Error:", e);
          extractedText = "PDF parsing failed. Please ensure the document is readable text-based PDF.";
        }
      } else if (req.file.mimetype.startsWith("image/")) {
        const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng+kan');
        extractedText = text;
      }
    } else if (req.body.text) {
      extractedText = req.body.text;
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ success: false, error: "No text found in document" });
    }
    res.json({ success: true, text: extractedText });
  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ success: false, error: "OCR processing failed" });
  }
});

// Email Notification Simulation
app.post("/api/notify-email", (req, res) => {
  const { email, subject, message } = req.body;
  console.log(`\n📧 [SIMULATED EMAIL SENT]\nTo: ${email}\nSubject: ${subject}\nMessage: ${message}\n`);
  res.json({ success: true, status: "simulated" });
});

// Save Notice (after frontend analysis)
app.post("/api/notices", async (req, res) => {
  try {
    const noticeData = req.body;
    const notices = JSON.parse(await fs.readFile(NOTICES_FILE, "utf-8"));
    const newNotice = {
      id: "ntc_" + Date.now(),
      ...noticeData,
      createdAt: new Date().toISOString()
    };
    notices.push(newNotice);
    await fs.writeFile(NOTICES_FILE, JSON.stringify(notices, null, 2));
    res.json({ success: true, data: newNotice });
  } catch (error) {
    res.status(500).json({ success: false, error: "Save failing" });
  }
});

// Chatbot Interface (using NIM if available, otherwise just returning error for now or mock)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, context } = req.body;
    const nimClient = getNimClient();
    if (nimClient) {
      const response = await nimClient.chat.completions.create({
        model: "meta/llama-3.1-405b-instruct",
        messages: [{ role: "user", content: `Context: ${context}\nUser: ${message}` }]
      });
      return res.json({ success: true, response: response.choices[0].message.content });
    }
    res.json({ success: true, response: "Backend chat requires NIM_API_KEY. Use frontend Gemini chat for now." });
  } catch (error) {
    res.status(500).json({ success: false, error: "Chat failed" });
  }
});

// Broadcast Notification
app.post("/api/broadcast", async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const notifications = JSON.parse(await fs.readFile(NOTIFICATIONS_FILE, "utf-8"));
    const newNotif = {
      id: "notif_" + Date.now(),
      title: title || "Broadcast Alert",
      message,
      type: type || "warning",
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
    res.json({ success: true, data: newNotif });
  } catch (error) {
    res.status(500).json({ success: false, error: "Broadcast failed" });
  }
});

app.get("/api/notifications", async (req, res) => {
  const notifications = JSON.parse(await fs.readFile(NOTIFICATIONS_FILE, "utf-8"));
  res.json({ success: true, data: notifications });
});

app.get("/api/notices", async (req, res) => {
  const notices = JSON.parse(await fs.readFile(NOTICES_FILE, "utf-8"));
  res.json({ success: true, data: notices });
});

app.get("/api/calendar", async (req, res) => {
  const notices = JSON.parse(await fs.readFile(NOTICES_FILE, "utf-8"));
  const events = notices.flatMap((n: any) => 
    (n.deadlines || []).map((d: any) => ({
      id: `ev_${n.id}_${d.date}`,
      title: `${n.title}: ${d.label}`,
      date: d.date,
      priority: d.isUrgent ? "high" : "medium"
    }))
  );
  res.json({ success: true, data: events });
});

async function startServer() {
  await ensureDataDir();
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🏛️ Backend online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
