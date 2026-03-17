<script>
  import { onMount } from "svelte";
</script>

<header>
  <nav>
    <a href="/">Home</a>

    <a href="/notes">Notes</a>
  </nav>
</header>

<style>
  header {
    background: #333;
    color: white;
    padding: 1rem;
    font-size: 1.2em;
  }

  nav {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    gap: 2rem;
  }

  nav a {
    color: white;
    text-decoration: none;
  }

  nav a:hover {
    color: #ccc;
  }
</style>
