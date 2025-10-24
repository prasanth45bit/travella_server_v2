const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// 🔹 Gemini AI Chat
router.post("/aichat", async (req, res) => {
  console.log("Received request body:", req.body);
  console.log(process.env.GEMINI_API_KEY );
  const { message } = req.body;
  const prompt = `You are a helpful travel assistant. Answer this question: ${message}`;
  try {
    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Gemini API failed", details: err });
  }
});

// ✅ Correct export method
module.exports = router;