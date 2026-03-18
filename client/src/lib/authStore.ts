import { writable } from "svelte/store";
import { authClient, getSession } from "./auth";

function createAuthStore() {
  const { subscribe, set, update } = writable({
    user: null,
    session: null,
    loading: true
  });

  return {
    subscribe,
    
    // Initialize auth state
    async initialize() {
      try {
        const sessionData = await getSession();
        if (sessionData) {
          set({
            user: sessionData.user,
            session: sessionData.session,
            loading: false
          });
        } else {
          set({ user: null, session: null, loading: false });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        set({ user: null, session: null, loading: false });
      }
    },

    // Logout
    async logout() {
      try {
        await authClient.signOut();
        set({ user: null, session: null, loading: false });
        window.location.href = "/";
      } catch (error) {
        console.error("Error logging out:", error);
      }
    },

    // Clear auth state
    clear() {
      set({ user: null, session: null, loading: false });
    }
  };
}

export const authStore = createAuthStore();
