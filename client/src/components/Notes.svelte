<script>
  import { onMount } from "svelte";
  import { authStore } from "../lib/authStore.ts";

  let notes = $state([]);
  let newNote = $state("");
  let loading = $state(false);
  let error = $state("");
  let user = $state(null);

  // Subscribe to auth store
  authStore.subscribe((state) => {
    user = state.user;
  });

  async function fetchNotes() {
    try {
      const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || "http://localhost:3000";
      const res = await fetch(`${backendUrl}/api/notes`, {
        credentials: "include"
      });

      if (res.ok) {
        notes = await res.json();
      } else if (res.status === 401) {
        error = "Please log in to view notes";
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        error = "Failed to fetch notes";
      }
    } catch (err) {
      error = err.message;
    }
  }

  async function addNote(event) {
    event.preventDefault();
    if (!newNote.trim()) return;

    loading = true;
    error = "";

    try {
      const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || "http://localhost:3000";
      const res = await fetch(`${backendUrl}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newNote.trim() })
      });

      if (res.ok) {
        const note = await res.json();
        notes = [note, ...notes];
        newNote = "";
      } else if (res.status === 401) {
        error = "Session expired. Please log in again.";
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        error = "Failed to create note";
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function handleLogout() {
    await authStore.logout();
  }

  onMount(async () => {
    await authStore.initialize();
    await fetchNotes();
  });
</script>

<div class="notes-container">
  <div class="header">
    <h1>My Notes</h1>
    {#if user}
      <div class="user-info">
        <span class="user-name">Welcome, {user.name}!</span>
        <button onclick={handleLogout} class="btn-logout">Logout</button>
      </div>
    {/if}
  </div>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <form onsubmit={addNote} class="note-form">
    <textarea
      bind:value={newNote}
      placeholder="Write a new note..."
      rows="4"
      required
    ></textarea>
    <button type="submit" disabled={loading}>
      {loading ? "Adding..." : "Add Note"}
    </button>
  </form>

  <div class="notes-list">
    {#if notes.length === 0}
      <p class="empty">No notes yet. Create your first note above!</p>
    {:else}
      {#each notes as note (note.id)}
        <div class="note-card">
          <p class="note-content">{note.content}</p>
          <p class="note-date">
            {new Date(note.createdAt).toLocaleDateString()} at {new Date(
              note.createdAt
            ).toLocaleTimeString()}
          </p>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .notes-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  h1 {
    margin: 0;
    color: #333;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-name {
    color: #666;
    font-weight: 500;
  }

  .btn-logout {
    padding: 0.5rem 1rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-logout:hover {
    background: #c82333;
  }

  .error {
    color: #dc3545;
    background: #f8d7da;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .note-form {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    margin-bottom: 1rem;
  }

  textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }

  button {
    padding: 0.75rem 1.5rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  button:hover:not(:disabled) {
    background: #0056b3;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .notes-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .empty {
    text-align: center;
    color: #6c757d;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .note-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s;
  }

  .note-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .note-content {
    margin: 0 0 1rem 0;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .note-date {
    margin: 0;
    font-size: 0.875rem;
    color: #6c757d;
  }
</style>
