<script>
  import { authClient } from "../lib/auth.ts";

  let mode = $state("login"); // 'login' or 'register'
  let email = $state("");
  let password = $state("");
  let name = $state("");
  let loading = $state(false);
  let error = $state("");
  let success = $state("");

  async function handleSubmit(event) {
    event.preventDefault();
    loading = true;
    error = "";
    success = "";

    try {
      if (mode === "register") {
        // Register new user
        const result = await authClient.signUp.email({
          email,
          password,
          name
        });

        if (result.error) {
          error = result.error.message || "Registration failed";
        } else {
          success = "Registration successful! Please log in.";
          // Switch to login mode after successful registration
          setTimeout(() => {
            mode = "login";
            password = "";
            success = "";
          }, 2000);
        }
      } else {
        // Login existing user
        const result = await authClient.signIn.email({
          email,
          password
        });

        if (result.error) {
          error = result.error.message || "Login failed";
        } else {
          success = "Login successful! Redirecting...";
          // Redirect to notes page after successful login
          setTimeout(() => {
            window.location.href = "/notes";
          }, 1000);
        }
      }
    } catch (err) {
      error = err.message || "An error occurred";
    } finally {
      loading = false;
    }
  }

  function toggleMode() {
    mode = mode === "login" ? "register" : "login";
    error = "";
    success = "";
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <h2>{mode === "login" ? "Login" : "Register"}</h2>

    {#if error}
      <div class="alert error">{error}</div>
    {/if}

    {#if success}
      <div class="alert success">{success}</div>
    {/if}

    <form onsubmit={handleSubmit}>
      {#if mode === "register"}
        <div class="form-group">
          <label for="name">Name</label>
          <input
            type="text"
            id="name"
            bind:value={name}
            placeholder="Your name"
            required
          />
        </div>
      {/if}

      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          bind:value={email}
          placeholder="your@email.com"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          bind:value={password}
          placeholder="••••••••"
          required
          minlength="6"
        />
      </div>

      <button type="submit" disabled={loading} class="btn-primary">
        {loading
          ? mode === "login"
            ? "Logging in..."
            : "Registering..."
          : mode === "login"
            ? "Login"
            : "Register"}
      </button>
    </form>

    <p class="toggle-mode">
      {mode === "login"
        ? "Don't have an account?"
        : "Already have an account?"}
      <button type="button" onclick={toggleMode} class="btn-link">
        {mode === "login" ? "Register" : "Login"}
      </button>
    </p>
  </div>
</div>

<style>
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .auth-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }

  h2 {
    margin: 0 0 1.5rem 0;
    color: #333;
    text-align: center;
    font-size: 1.8rem;
  }

  .alert {
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .alert.error {
    background-color: #fee;
    color: #c33;
    border: 1px solid #fcc;
  }

  .alert.success {
    background-color: #efe;
    color: #3c3;
    border: 1px solid #cfc;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  label {
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
  }

  input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s;
  }

  input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .btn-primary {
    padding: 0.75rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    margin-top: 0.5rem;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .toggle-mode {
    text-align: center;
    margin-top: 1.5rem;
    color: #666;
    font-size: 0.9rem;
  }

  .btn-link {
    background: none;
    border: none;
    color: #667eea;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-left: 0.3rem;
    text-decoration: underline;
  }

  .btn-link:hover {
    color: #764ba2;
  }
</style>
