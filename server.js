const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Home
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Status API
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        status: "online",
        ai: "Qwen3 4B",
        provider: "Ollama Local AI"
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

        const ollamaResponse = await fetch(
            "http://127.0.0.1:11434/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    model: "qwen3:4b-instruct",

                    messages: [
                        {
                            role: "user",
                            content: message
                        }
                    ],

                    // Disable Qwen thinking for faster replies
                    think: false,

                    stream: false,

                    options: {
                        temperature: 0.7,
                        num_predict: 300
                    }
                })
            }
        );

        console.log(
            "🤖 Ollama HTTP Status:",
            ollamaResponse.status
        );

        if (!ollamaResponse.ok) {

            const errorText = await ollamaResponse.text();

            console.error(
                "❌ Ollama Error:",
                errorText
            );

            return res.status(500).json({
                success: false,
                error: "Ollama error: " + errorText
            });
        }

        const data = await ollamaResponse.json();

        console.log("✅ Qwen response received");

        const reply =
            data?.message?.content ||
            "Sorry, I could not generate a response.";

        console.log("🤖 G-AI:", reply);

        res.json({
            success: true,
            reply: reply
        });

    } catch (error) {

        console.error(
            "❌ Local AI Error:",
            error
        );

        res.status(500).json({
            success: false,
            error: error.message || "Unable to connect to Ollama"
        });
    }
});

// Start server
app.listen(PORT, () => {

    console.log("");
    console.log("=================================");
    console.log("🚀 G-AI Server Started");
    console.log("🤖 Qwen3 4B Local AI");
    console.log("⚡ Fast Mode: Thinking Disabled");
    console.log("🔑 No API Key Required");
    console.log("=================================");
    console.log(
        `🌐 http://localhost:${PORT}`
    );
    console.log("");
});