# Dev Container Setup

This directory contains the configuration for VS Code Dev Containers, enabling a consistent development environment for the SIFAP Modernization Workshop.

## Quick Start

1. **Install Prerequisites:**
   - [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker & Docker Compose)
   - [VS Code](https://code.visualstudio.com/)
   - [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Open in Container:**
   - Open this workspace in VS Code
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Dev Containers: Reopen in Container"
   - Select and wait for the container to build and start

3. **Start Services:**
   ```bash
   docker-compose up -d
   ```

4. **Access Services:**
   - **Backend API:** http://localhost:8080
   - **Frontend:** http://localhost:3001
   - **PostgreSQL:** localhost:5432 (credentials in `.env`)

## What's Included

### Base Image
- **Java 21** (via `mcr.microsoft.com/devcontainers/java:21-jammy`)
- Ubuntu 22.04 (Jammy) base

### Dev Container Features
- **Docker** (Docker-outside-of-Docker via host mount)
- **GitHub CLI** (for GitHub operations)
- **Node.js 20** (for frontend development)
- **PostgreSQL 15** (tools & client)

### VS Code Extensions
- GitHub Copilot & Copilot Chat
- Java support (Red Hat Language Server, Maven, Spring Boot Dashboard)
- TypeScript, ESLint, Prettier
- Docker & Azure Functions extensions

### Port Forwarding
- **8080** → Backend (Spring Boot)
- **3001** → Frontend (Next.js)
- **5432** → PostgreSQL (ignored by default)

## File Structure

```
.devcontainer/
├── devcontainer.json    # Main dev container configuration
├── post-create.sh       # Runs after container creation (installs deps)
└── README.md           # This file
```

## How It Works

1. **devcontainer.json** defines:
   - Base image (Java 21 Ubuntu)
   - Features to install (Docker, Node.js, Git, etc.)
   - VS Code extensions
   - Environment variables
   - Port forwarding rules
   - Post-create script

2. **post-create.sh** runs after container startup:
   - Updates system packages
   - Installs Docker Compose if needed
   - Installs Node.js dependencies (frontend)
   - Installs Maven dependencies (backend)
   - Creates `.env` from `.env.example`

## Development Workflow

### Option A: Full Stack in Container

```bash
# Inside dev container
docker-compose up -d          # Start all services
docker-compose logs -f        # View logs
docker-compose down           # Stop all services
```

### Option B: Services in Docker, Code in Container

```bash
# Backend development (inside container)
cd prototype/backend
mvn clean package
java -jar target/*.jar

# Frontend development (inside container)
cd prototype/frontend
npm run dev
```

## Environment Variables

The dev container is configured with:

```env
POSTGRES_DB=sifap
POSTGRES_USER=sifap
POSTGRES_PASSWORD=sifap_local
SIFAP_JWT_SECRET=dev-secret-min-32-chars-long!!!!!
```

These are also copied to `.env` in the workspace root from `.env.example`.

## Rebuilding the Container

If you modify `.devcontainer/devcontainer.json`:

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Dev Containers: Rebuild Container"
3. Wait for rebuild to complete

## Troubleshooting

### Container won't start
- Check Docker Desktop is running
- Verify `.devcontainer/devcontainer.json` has valid JSON
- Review VS Code output for error messages

### Port conflicts
- If ports are in use, modify `forwardPorts` in `devcontainer.json`
- Or stop conflicting services: `docker stop <container>`

### Docker-compose not found
- Restart the container (it installs in post-create)
- Or manually: `curl -sL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose`

### Slow performance on Windows
- Use WSL 2 backend for Docker Desktop
- Store workspace in WSL filesystem, not Windows mount

## Additional Resources

- [VS Code Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Dev Container Spec](https://containers.dev/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
