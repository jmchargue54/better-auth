# Better Auth + Astro + Express Setup

This covers the Better Auth setup in the `better-auth` folder.

## Quickstart

1. Open the `better-auth` directory in VSCode. Find the `.env.sample` in each directory.
2. Rename the files to `.env`
3. Find your MongoDB Atlas connection string and place it into the `.env` in the server directory.
4. From two terminals:

```bash
cd better-auth/server
pnpm install
pnpm dev
```

```bash
cd better-auth/client
pnpm install
pnpm dev
```

5. Visit:

- Client: http://localhost:4322
- Server: http://localhost:3000
- Health check: http://localhost:3000/health

6. In the client visit the Notes page and enter a note. Make sure it saves correctly and displays when you refresh the page.
