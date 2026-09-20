const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Home
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Status
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        status: "online",
        ai: "Gemini",
        provider: "Google Gemini API"
    });
});

// Chat API
app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body.message;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: "Message is required"
            });
        }

        console.log("💬 User:", message);

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: message,
            config: {
                temperature: 0.7,
                maxOutputTokens: 500
            }
        });

        const reply =
            response.text ||
            "Sorry, I could not generate a response.";

        console.log("🤖 G-AI:", reply);

        res.json({
            success: true,
            reply: reply
        });

    } catch (error) {
        console.error("❌ Gemini Error:", error);

        res.status(500).json({
            success: false,
            error: error.message || "Gemini API error"
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log("");
    console.log("=================================");
    console.log("🚀 G-AI Server Started");
    console.log("🤖 Google Gemini AI");
    console.log("☁️ Cloud Ready");
    console.log("=================================");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("");
});