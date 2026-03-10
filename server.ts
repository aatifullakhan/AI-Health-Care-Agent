import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const MOCK_USER = { id: "doctor", password: "1234" };

const db = new Database("medical.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT,
    transcription TEXT,
    symptoms TEXT,
    diagnosis TEXT,
    medicines TEXT,
    soap_notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT,
    age INTEGER,
    phone TEXT,
    symptoms TEXT,
    appointment_date TEXT,
    appointment_time TEXT,
    status TEXT DEFAULT 'Scheduled'
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age INTEGER,
    gender TEXT,
    blood_group TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    medical_history TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    patient_name TEXT,
    symptoms TEXT,
    diagnosis TEXT,
    medicines TEXT,
    dosage TEXT,
    doctor_name TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(id)
  )
`);

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/consultations", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Convert buffer to base64
      const patientName = req.body.patientName || "Unknown Patient";

    const base64Audio = req.file.buffer.toString("base64");

      const prompt = `
        You are an expert medical assistant. 
        Analyze the provided audio of a doctor-patient consultation.
        1. Transcribe the conversation accurately.
        2. Extract symptoms mentioned.
        3. Provide a possible diagnosis.
        4. Suggest recommended medicines.
        5. Generate SOAP clinical notes:
           - Subjective: Doctor observations and patient complaints.
           - Objective: Measured findings or symptoms.
           - Assessment: Possible diagnosis.
           - Plan: Treatment plan and medicines.
        
        Return the response in the following JSON format:
        {
          "transcription": "...",
          "symptoms": ["...", "..."],
          "diagnosis": "...",
          "medicines": ["...", "..."],
          "soap": {
            "subjective": "...",
            "objective": "...",
            "assessment": "...",
            "plan": "..."
          }
        }
      `;

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: req.file.mimetype,
                  data: base64Audio,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      const report = JSON.parse(result.text || "{}");

      // Save to DB
      const stmt = db.prepare(`
        INSERT INTO consultations (patient_name, transcription, symptoms, diagnosis, medicines, soap_notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const info = stmt.run(
        patientName,
        report.transcription,
        JSON.stringify(report.symptoms),
        report.diagnosis,
        JSON.stringify(report.medicines),
        JSON.stringify(report.soap)
      );

      res.json({
        id: info.lastInsertRowid,
        ...report
      });

    } catch (error: any) {
      console.error("Error processing consultation:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/consultations", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM consultations ORDER BY timestamp DESC").all();
      const parsedRows = rows.map((row: any) => ({
        ...row,
        symptoms: JSON.parse(row.symptoms),
        medicines: JSON.parse(row.medicines),
        soap: row.soap_notes ? JSON.parse(row.soap_notes) : null
      }));
      res.json(parsedRows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics", (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let query = "SELECT symptoms, timestamp FROM consultations";
      const params: any[] = [];

      if (startDate && endDate) {
        query += " WHERE timestamp BETWEEN ? AND ?";
        params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
      } else if (startDate) {
        query += " WHERE timestamp >= ?";
        params.push(`${startDate} 00:00:00`);
      } else if (endDate) {
        query += " WHERE timestamp <= ?";
        params.push(`${endDate} 23:59:59`);
      }

      const rows = db.prepare(query).all(...params);
      const symptomCounts: Record<string, number> = {};
      const dailyTrends: Record<string, number> = {};
      
      rows.forEach((row: any) => {
        // Symptom counts
        const symptoms = JSON.parse(row.symptoms);
        symptoms.forEach((s: string) => {
          symptomCounts[s] = (symptomCounts[s] || 0) + 1;
        });

        // Daily trends
        const date = new Date(row.timestamp).toLocaleDateString();
        dailyTrends[date] = (dailyTrends[date] || 0) + 1;
      });

      const symptomData = Object.entries(symptomCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      const trendData = Object.entries(dailyTrends)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      res.json({ symptoms: symptomData, trends: trendData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/consultations/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM consultations WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Appointment Routes
  app.post("/api/appointments", (req, res) => {
    try {
      const { patient_name, age, phone, symptoms, appointment_date, appointment_time } = req.body;
      
      // Check for conflicts
      const conflict = db.prepare("SELECT * FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND status = 'Scheduled'").get(appointment_date, appointment_time);
      
      if (conflict) {
        return res.status(400).json({ 
          error: "Appointment conflict detected.",
          message: "This time slot is already booked. Please select another time."
        });
      }

      const stmt = db.prepare(`
        INSERT INTO appointments (patient_name, age, phone, symptoms, appointment_date, appointment_time)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(patient_name, age, phone, symptoms, appointment_date, appointment_time);
      
      res.json({ 
        success: true, 
        appointment_id: info.lastInsertRowid,
        message: "Appointment booked successfully!" 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/appointments", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM appointments ORDER BY appointment_date ASC, appointment_time ASC").all();
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/appointments/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      db.prepare("UPDATE appointments SET status = ? WHERE appointment_id = ?").run(status, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Patient EMR Routes
  app.get("/api/patients", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM patients ORDER BY name ASC").all();
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/patients", (req, res) => {
    try {
      const { name, age, gender, blood_group, phone, email, address, medical_history } = req.body;
      const stmt = db.prepare(`
        INSERT INTO patients (name, age, gender, blood_group, phone, email, address, medical_history)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(name, age, gender, blood_group, phone, email, address, medical_history);
      res.json({ id: info.lastInsertRowid, success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Prescription Routes
  app.post("/api/prescriptions", (req, res) => {
    try {
      const { patient_id, patient_name, symptoms, diagnosis, medicines, dosage, doctor_name } = req.body;
      const stmt = db.prepare(`
        INSERT INTO prescriptions (patient_id, patient_name, symptoms, diagnosis, medicines, dosage, doctor_name)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(patient_id, patient_name, symptoms, diagnosis, JSON.stringify(medicines), dosage, doctor_name);
      res.json({ id: info.lastInsertRowid, success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/prescriptions", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM prescriptions ORDER BY date DESC").all();
      const parsedRows = rows.map((row: any) => ({
        ...row,
        medicines: JSON.parse(row.medicines)
      }));
      res.json(parsedRows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Chatbot Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "API key not configured" });

      const ai = new GoogleGenAI({ apiKey });
      
      // Convert history to the format expected by the SDK if necessary
      // The SDK expects { role: 'user' | 'model', parts: [{ text: string }] }
      
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: "You are a professional medical assistant. Provide helpful, accurate, and concise medical information. Always advise consulting a real doctor for serious conditions."
        },
        history: history || []
      });

      const result = await chat.sendMessage({ message });
      res.json({ text: result.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
