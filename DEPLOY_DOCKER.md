# Deploy with Docker on a Linux Server

This guide shows how to deploy this Next.js app with Docker on a Linux host (Ubuntu/Debian/Alma/etc.). It uses a production-optimized image that serves the app via Next.js standalone server.

Contents
- Prerequisites
- Prepare environment variables
- Option A: Use Neon (recommended) or any managed Postgres
- Option B: Self-host Postgres via Docker (optional)
- Build and run with Docker Compose
- Run database migrations (required, one-time per database)
- Seed the first admin (optional)
- Reverse proxy and HTTPS (recommended)
- Update / rollback
- Troubleshooting

## Prerequisites
- A Linux x86_64 server with at least 1 vCPU and 512 MB RAM (2 GB+ recommended)
- Docker and Docker Compose plugin
- A domain name and DNS pointing to your server (for HTTPS and QR scanner camera permissions)

Install Docker (Ubuntu example):
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Optional: run docker without sudo
sudo usermod -aG docker $USER
# Logout/login to apply group membership
```

## Prepare environment variables
On your server, create a .env file next to docker-compose.yml:
```bash
cp .env.example .env
```
Fill at least:
- DATABASE_URL=postgres://... (Neon/managed/Postgres connection string)
- BETTER_AUTH_SECRET=long-random-secret
- BETTER_AUTH_URL=https://your-domain.example.com

Notes:
- BETTER_AUTH_URL must be the public URL of your site, including protocol (https in production), used for cookies and callbacks.
- Keep .env private; it’s mounted only by Docker Compose.

## Option A: Use Neon (recommended)
Create a Neon Postgres project and copy its connection string into DATABASE_URL. Neon is fast to set up and accessible from anywhere.

## Option B: Self-host Postgres via Docker (optional)
This repo includes a commented Postgres service in docker-compose.yml. To use it:
1) Uncomment the db service and the depends_on in app service.
2) Set DATABASE_URL to: postgres://app:app@db:5432/app
3) Expose port 5432 only if you need access from outside the server.

## Build and run with Docker Compose
From the project root on the server:
```bash
# Build the image and start the app
docker compose up -d --build

# Check logs
docker compose logs -f app
```
The app listens on port 3000 by default. You can change the host port in docker-compose.yml (e.g., "8080:3000").

## Run database migrations (required)
Run migrations once per database (initial setup or schema changes). The recommended way is to run them from your local machine pointing to the production DB:

Local terminal (not inside the container):
```bash
# On your laptop/workstation
# 1) Set DATABASE_URL to your production DB connection string
export DATABASE_URL="postgres://..."

# 2) Push the schema
pnpm drizzle:push
```

If you’re using the optional Postgres container and exposed port 5432, you can also set DATABASE_URL to that address from your local machine:
```bash
export DATABASE_URL="postgres://app:app@<server-public-ip>:5432/app"
pnpm drizzle:push
```

Why not run migrations inside the container? To keep the runtime image minimal, dev tools aren’t baked in. Running migrations from your workstation avoids adding build tooling to production containers.

## Seed the first admin (optional)
To create an initial admin user in production:
1) Temporarily add to your server .env:
```
ENABLE_SEED=1
SEED_ADMIN_EMAIL=admin@admin.com
SEED_ADMIN_PASSWORD=12345678
SEED_ADMIN_NAME=Admin
```
2) Recreate the app (loads env):
```bash
docker compose up -d --build
```
3) Call the seed endpoint once (replace domain):
```bash
curl -X POST https://your-domain.example.com/api/seed \
  -H 'content-type: application/json' \
  -d '{"email":"admin@admin.com","password":"12345678","name":"Admin"}'
```
4) Remove ENABLE_SEED and related vars from .env and redeploy to disable the endpoint.

## Reverse proxy and HTTPS (recommended)
Browsers require HTTPS for camera access used by QR scanning. Put the app behind a reverse proxy that terminates TLS.

Example with Caddy (easy automatic HTTPS):
```
your-domain.example.com {
  reverse_proxy 127.0.0.1:3000
}
```
Systemd service to run Caddy is documented at https://caddyserver.com/docs/running#systemd

Nginx sample (using a process on port 3000):
```
server {
  listen 80;
  server_name your-domain.example.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
Use certbot or a managed TLS solution to add HTTPS.

## Update / rollback
Update code and rebuild the image:
```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build

# View container status
docker ps
```
If you need to roll back, check out a previous git commit and rebuild.

## Troubleshooting
- 502/404 through proxy: hit http://SERVER_IP:3000 directly to confirm the app is running.
- Healthcheck failing: `docker inspect --format='{{json .State.Health}}' gathering-app | jq` for details.
- 500 DB errors: verify DATABASE_URL and that migrations were applied to the same database the app uses.
- Auth/login issues: ensure BETTER_AUTH_URL matches your public https domain and cookies aren’t blocked.
- QR camera blocked: HTTPS is required; use a valid certificate and a public hostname.
- Logs: `docker compose logs -f app`

## Notes on rendering modes
- SSG/ISR/SSR/CSR are all supported out of the box by Next.js. This image runs the app as a Node server, so SSR and API routes work. Static pages are served from the same container. ISR revalidation runs within the server process.

---
Built image details
- Multi-stage Dockerfile with `next build` output: standalone runtime + static assets
- Healthcheck with curl
- Exposes port 3000; map via Compose to your desired host port

