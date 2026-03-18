import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Create and connect MongoDB client for Better-Auth
const authClient = new MongoClient(process.env.DATABASE_URL);
await authClient.connect();
const authDb = authClient.db(process.env.DATABASE_NAME || "better-auth");

// Initialize Better-Auth with MongoDB adapter
export const auth = betterAuth({
  database: mongodbAdapter(authDb),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false // Set to true if you want email verification
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day
  },
  secret: process.env.JWT_SECRET || "your-secret-key-here",
  baseURL: process.env.SERVER_URL || "http://localhost:3000",
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:4321"]
});

// Express middleware wrapper for Better-Auth
export const authHandler = async (req, res) => {
  try {
    // Construct the full URL for Better-Auth
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const originalUrl = req.originalUrl || req.url;
    const fullUrl = `${protocol}://${host}${originalUrl}`;
    
    // Convert Express headers to Web API Headers format
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    });
    
    // Prepare request options
    const requestOptions = {
      method: req.method,
      headers: headers,
    };
    
    // Add body for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      requestOptions.body = JSON.stringify(req.body);
      headers.set('content-type', 'application/json');
    }
    
    // Call Better-Auth handler with Web API Request
    const authResponse = await auth.handler(new Request(fullUrl, requestOptions));

    // Convert Better-Auth Response to Express response
    authResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    res.status(authResponse.status);
    const body = await authResponse.text();
    res.send(body);
  } catch (error) {
    console.error("Auth handler error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
};

// Middleware to check if user is authenticated
export const requireAuth = async (req, res, next) => {
  try {
    // Get the session from the request
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Attach session and user to request object
    req.session = session.session;
    req.user = session.user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
