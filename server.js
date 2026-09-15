require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.json({
        success: true,
        app: "StoryAff AI",
        version: "1.0.0",
        status: "online"
    });
});

app.get("/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/ai/test", (req, res) => {
    res.json({
        success: true,
        message: "StoryAff AI engine is ready.",
        nextStep: "Connect AI"
    });
});

app.listen(PORT, () => {
    console.log("=================================");
    console.log("       STORYAFF AI BACKEND");
    console.log("=================================");
    console.log("Server running on port " + PORT);
});
