import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.DATABASE_URL);
let db = null;

// Initialize database connection with proper error handling
export async function initializeDatabase() {
  try {
    await client.connect();
    db = client.db(process.env.DATABASE_NAME || "better-auth");
    console.log("Database connection established");
    return db;
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    process.exit(1);
  }
}

// Get the database instance (assumes initializeDatabase has been called)
export function getDatabase() {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first."
    );
  }
  return db;
}

// Graceful shutdown
export async function closeDatabase() {
  if (client) {
    await client.close();
    console.log("Database connection closed");
  }
}
