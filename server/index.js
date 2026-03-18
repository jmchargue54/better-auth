import express from "express";
import cors from "cors";

import { initializeDatabase, closeDatabase, getDatabase } from "./database.js";
import { auth, authHandler, requireAuth } from "./auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database before starting server
await initializeDatabase();

// CORS Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:4321",
    credentials: true
  })
);

// JSON body parsing...
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is Running!");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Better-Auth routes - handles all /api/auth/* routes
app.use(/^\/api\/auth(\/.*)?$/, authHandler);

// Get current user session
app.get("/api/session", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    res.json({
      user: session.user,
      session: session.session
    });
  } catch (error) {
    console.error("Error getting session:", error);
    res.status(500).json({ error: "Failed to get session" });
  }
});

// Notes endpoints - protected by authentication
app.get("/api/notes", requireAuth, async (req, res) => {
  try {
    const db = getDatabase();

    // Filter notes by userId to show only user's own notes
    const notes = await db
      .collection("notes")
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

app.post("/api/notes", requireAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Content is required" });
    }

    const note = {
      content: content.trim(),
      userId: req.user.id,
      createdAt: new Date().toISOString()
    };

    await db.collection("notes").insertOne(note);

    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
});
