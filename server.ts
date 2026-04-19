import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Service logic moved to server
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  app.post("/api/ai/suggestions", async (req, res) => {
    try {
      const { prompt, systemInstruction, model = "gemini-3-flash-preview" } = req.body;
      const result = await genAI.models.generateContent({ 
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      res.json({ text: result.text || "" });
    } catch (error) {
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: "Failed to generate AI content" });
    }
  });

  app.post("/api/ai/estimate", async (req, res) => {
    try {
      const { mealName, portion } = req.body;
      const prompt = `
        Estimate the total calories for the following meal:
        Meal: ${mealName}
        Portion Size: ${portion}
        Provide only the estimated calorie number as a plain integer.
      `;
      const result = await genAI.models.generateContent({ 
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a nutritional database. You respond with raw numbers representing calorie estimates.",
          temperature: 0.1,
        }
      });
      const text = result.text || "0";
      const calories = parseInt(text.replace(/[^0-9]/g, ''));
      res.json({ calories: isNaN(calories) ? 0 : calories });
    } catch (error) {
      console.error("AI Estimate Error:", error);
      res.status(500).json({ error: "Failed to estimate calories" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
