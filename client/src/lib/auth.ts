import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_BACKEND_URL || "http://localhost:3000"
});

// Helper function to get current session
export async function getSession() {
  try {
    const response = await fetch(
      `${import.meta.env.PUBLIC_BACKEND_URL || "http://localhost:3000"}/api/session`,
      {
        credentials: "include"
      }
    );

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
