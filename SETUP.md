# PetCare - Detailed Setup Guide

Complete step-by-step instructions to set up and run PetCare on a new computer.

## 📋 Prerequisites

Ensure you have the following installed on your system:

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Docker & Docker Compose** (Optional, for containerized setup) - [Download](https://www.docker.com/products/docker-desktop)

### Verify Installations
```bash
node --version      # Should be v16+
npm --version       # Should be v7+
git --version       # Any recent version
psql --version      # For PostgreSQL
docker --version    # Optional
docker-compose --version  # Optional
```

## 🔗 Clone the Repository

```bash
# Clone the repository
git clone https://github.com/[USERNAME]/Pet-Care.git

# Navigate to project directory
cd Pet-Care
```

Replace `[USERNAME]/Pet-Care.git` with your actual GitHub repository URL.

---

## 🐳 Option A: Quick Start with Docker (Recommended)

### Step 1: Ensure Docker is Running
```bash
# On macOS/Windows, open Docker Desktop application
# On Linux, ensure docker daemon is running
docker --version
docker ps  # Should not show errors
```

### Step 2: Start All Services
```bash
# From the Pet-Care directory
docker-compose up -d
```

This command:
- Downloads required images
- Creates and starts PostgreSQL, backend, and frontend containers
- Sets up a persistent database volume
- Initializes the database with migrations

### Step 3: Verify Services Are Running
```bash
# Check all containers
docker-compose ps

# View logs (optional)
docker-compose logs -f backend   # Backend logs
docker-compose logs -f frontend  # Frontend logs
docker-compose logs -f postgres  # Database logs
```

### Step 4: Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health

### Step 5: Stop Services (When Done)
```bash
docker-compose down
```

---

## 💻 Option B: Local Setup Without Docker

### Step 1: Install PostgreSQL & Create Database

#### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database and user
createdb petcare
createuser -P workshop  # When prompted, enter password: workshop123
```

#### Windows
- Run PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
- Choose password: `workshop123`
- During installation, create database `petcare`
- Note the port (default: 5432)

#### Linux (Ubuntu/Debian)
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Create database and user
sudo -u postgres createdb petcare
sudo -u postgres createuser -P workshop  # Enter password: workshop123
```

### Step 2: Connect and Configure Database
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql shell:
CREATE DATABASE petcare;
CREATE USER workshop WITH PASSWORD 'workshop123';
GRANT ALL PRIVILEGES ON DATABASE petcare TO workshop;
\q  # Exit psql
```

### Step 3: Configure Security (.env file)

Before starting the backend, configure security settings:

**In petcare-api/ directory:**
```bash
# Copy example environment file
cp .env.example .env

# Edit the .env file with your settings
nano .env  # or use your preferred editor
```

**Key security configurations:**
```
# JWT Secret - CHANGE THIS IN PRODUCTION!
JWT_SECRET="your-super-secret-key-min-32-characters"

# CORS Origins - who can access the API
CORS_ORIGINS="http://localhost:5173"

# Node environment
NODE_ENV=development
```

### Step 4: Backend Setup

```bash
# Navigate to backend directory
cd petcare-api

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://workshop:workshop123@localhost:5432/petcare?schema=public"
PORT=3000
NODE_ENV=development
EOF

# Run initial database migration
npx prisma migrate deploy

# Start backend server
npm run dev
```

You should see:
```
✅ Server running on http://localhost:3000
```

**Keep this terminal open.** The backend will automatically reload when you make changes.

### Step 4: Frontend Setup (New Terminal)

```bash
# Open a new terminal and navigate to frontend
cd Pet-Care/petcare-client

# Install dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
VITE v5.4.1  ready in XXX ms

➜  Local:   http://localhost:5173
```

### Step 6: Verify Everything Works

1. Open browser to http://localhost:5173
2. The frontend should load without errors
3. **Test API with Rate Limiting:**
   - Get a test JWT token:
   ```bash
   curl -X POST http://localhost:3000/api/test/token
   ```
   - Use the token in requests:
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:3000/api/activities
   ```
4. Try creating a new activity:
   - Pet Name: "Buddy"
   - Activity Type: "EXERCISE"
   - Description: "Morning walk"
   - Duration: "30"
5. Activity should appear in the list
6. Check API metrics:
   ```bash
   curl http://localhost:3000/api/metrics
   ```

### Step 6: Stop Services

```bash
# Terminal 1 (Backend): Ctrl+C
# Terminal 2 (Frontend): Ctrl+C

# Stop PostgreSQL (macOS)
brew services stop postgresql

# Stop PostgreSQL (Linux)
sudo systemctl stop postgresql
```

---

## 🗄️ Database Reset (If Needed)

### With Docker
```bash
# Stop containers
docker-compose down

# Remove database volume
docker volume rm pet-care_petcare_data

# Restart services (migrations will run automatically)
docker-compose up -d
```

### Without Docker
```bash
# Connect to PostgreSQL
psql -U workshop -d postgres

# Drop and recreate database
DROP DATABASE petcare;
CREATE DATABASE petcare;
GRANT ALL PRIVILEGES ON DATABASE petcare TO workshop;
\q

# In petcare-api directory:
npx prisma migrate deploy
```

---

## 🔧 Common Issues & Troubleshooting

### Port Already in Use

#### Error: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process (macOS/Linux)
kill -9 <PID>

# Or change port in petcare-api/.env
# PORT=3001
```

### PostgreSQL Connection Failed

**Error:**
```
Error: getaddrinfo ENOTFOUND localhost
```

**Solutions:**
```bash
# 1. Verify PostgreSQL is running
# macOS:
brew services list | grep postgres

# Linux:
sudo systemctl status postgresql

# 2. Check connection string in .env
# Should be: postgresql://workshop:workshop123@localhost:5432/petcare?schema=public

# 3. Test connection manually
psql -U workshop -d petcare -h localhost
# If successful, you'll see the psql prompt
```

### Node Version Mismatch

**Error:**
```
npm ERR! The engine "node" is incompatible with this package
```

**Solution:**
```bash
# Install NVM (Node Version Manager)
# Instructions: https://github.com/nvm-sh/nvm#installing-and-updating

# Install Node 18
nvm install 18
nvm use 18

# Verify version
node --version  # Should be v18.x.x
```

### CORS Errors in Frontend

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/activities' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solutions:**
- Ensure backend is running on port 3000
- Check that frontend is on port 5173
- CORS is already configured in `petcare-api/src/app.js`

### Database Migrations Failed

**Error:**
```
Database connection failed. Can't reach database server
```

**Solution:**
```bash
# In petcare-api directory, check database connection:
npx prisma db push --skip-generate

# Or reset and reapply migrations:
npx prisma migrate reset  # Be careful - this deletes all data!
```

---

## ⚙️ Environment Variables

### Backend Configuration

### Backend (.env in petcare-api/)
```
DATABASE_URL=postgresql://workshop:workshop123@localhost:5432/petcare?schema=public
PORT=3000
NODE_ENV=development
```

### Frontend (Vite uses environment variables from .env)
Create `petcare-client/.env` if needed:
```
VITE_API_BASE_URL=http://localhost:3000
```

---

## 🧪 Testing the API

### Use curl or Postman

#### Get All Activities
```bash
curl http://localhost:3000/api/activities
```

#### Create Activity
```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "petName": "Buddy",
    "activityType": "VET_VISIT",
    "description": "Annual checkup",
    "duration": 60
  }'
```

#### Filter Activities
```bash
curl "http://localhost:3000/api/activities/filter?activityType=VET_VISIT"
curl "http://localhost:3000/api/activities/filter?petName=Buddy&startDate=2026-01-01&endDate=2026-12-31"
```

#### Get Vet Counter
```bash
curl http://localhost:3000/api/activities/vet-counter/Buddy
```

#### Delete Activity
```bash
curl -X DELETE http://localhost:3000/api/activities/1
```

---

## 📦 Project Dependencies

### Backend
- `express`: ^4.18.2 - Web framework
- `@prisma/client`: ^5.0.0 - Database ORM
- `cors`: ^2.8.5 - CORS middleware
- `dotenv`: ^16.3.1 - Environment variables
- `nodemon`: ^2.0.22 - Auto-reload in development

### Frontend
- `react`: ^18.3.1 - UI framework
- `react-dom`: ^18.3.1 - React DOM renderer
- `axios`: ^1.5.0 - HTTP client
- `vite`: ^5.4.1 - Build tool
- `tailwindcss`: ^3.4.4 - CSS framework
- `@vitejs/plugin-react`: ^4.3.1 - Vite React plugin

---

## 🚀 Development Workflow

### Backend Development
```bash
cd petcare-api
npm run dev
```
- Nodemon watches for changes
- Server automatically restarts
- Keep terminal open to see logs

### Frontend Development
```bash
cd petcare-client
npm run dev
```
- Vite shows URLs to access frontend
- Hot module replacement: changes appear instantly
- No manual refresh needed

### Database Schema Changes
```bash
cd petcare-api

# Edit prisma/schema.prisma

# Create and apply migration
npx prisma migrate dev --name <descriptive_name>

# Example:
# npx prisma migrate dev --name add_pet_breed_field
```

### View Database Visually
```bash
# Install Prisma Studio
cd petcare-api
npx prisma studio

# Opens browser UI at http://localhost:5555
```

---

## 🔄 Git Workflow

### Save Your Changes
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### Sync Latest Changes
```bash
git pull origin main
npm install  # In petcare-api and petcare-client if packages changed
```

---

## 📚 Useful Resources

- **Node.js Docs**: https://nodejs.org/docs/
- **Express.js Guide**: https://expressjs.com/
- **Prisma Docs**: https://www.prisma.io/docs/
- **React Docs**: https://react.dev/
- **Vite Guide**: https://vitejs.dev/guide/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Docker Docs**: https://docs.docker.com/

---

## 📞 Getting Help

1. **Check logs**: Review terminal output for errors
2. **Google the error**: Copy the error message and search
3. **Check documentation**: Links above for framework-specific issues
4. **Database issues**: Run `npx prisma studio` to inspect data
5. **Network issues**: Use browser dev tools (F12) to inspect network requests

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` in backend
- [ ] Update CORS origins to production URLs
- [ ] Update `VITE_API_BASE_URL` to production API URL
- [ ] Use strong database password (not `workshop123`)
- [ ] Enable HTTPS for API and frontend
- [ ] Set up proper logging and monitoring
- [ ] Run database backups
- [ ] Test all API endpoints with production data
- [ ] Optimize frontend build with `npm run build`
- [ ] Use managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)

---

## 🔐 Security Configuration Guide

### Understanding the Security Features

Your PetCare backend is protected with multiple security layers:

**1. Rate Limiting - Protects Against DDoS**
- General API: 100 requests per 15 minutes
- Create operations: 20 per minute
- This prevents someone from hammering your API with thousands of requests

**2. JWT Authentication - Secure Access**
- Tokens expire after 24 hours
- Each request can verify the user's role
- Development test endpoint: `POST /api/test/token`

**3. CORS Lockdown - Prevent Unauthorized Access**
- Only your frontend domain can access the API
- Change `CORS_ORIGINS` in `.env` for different domains

**4. HTTP Security Headers**
- Prevents clickjacking attacks
- Prevents XSS attacks
- Enforces HTTPS in production

### Production Security Checklist

Before deploying to production:

- [ ] **Change JWT_SECRET** to a long random string (min 32 characters)
  ```bash
  openssl rand -base64 32
  ```

- [ ] **Update CORS_ORIGINS** to your production domain
  ```
  CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
  ```

- [ ] **Set NODE_ENV=production**
  ```
  NODE_ENV=production
  ```

- [ ] **Change database password** from `workshop123`
  ```bash
  # Generate secure password
  openssl rand -base64 20
  ```

- [ ] **Enable HTTPS** for all connections
  - Use Let's Encrypt for free SSL certificates
  - Configure reverse proxy (nginx) to handle SSL

- [ ] **Monitor API metrics** regularly
  ```bash
  curl https://api.yourdomain.com/api/metrics
  ```

- [ ] **Set up logging** to catch errors in production
  - Use ELK Stack or Splunk
  - Monitor high error rates

- [ ] **Back up the database** regularly
  - Daily backups minimum
  - Test restore procedures

### Rate Limiting Strategy

**Current Limits (Development):**
```
General API:     100 requests per 15 minutes
Reading:         60 per minute
Creating:        20 per minute
Logins:          5 attempts per 15 minutes
Admin users:     Unlimited
```

**When to Adjust:**
- If legitimate users hit limits → increase limits
- If you see abuse patterns → decrease limits
- Monitor `/api/metrics` for rate limit hits

**Checking Rate Limit Status:**
Responses include headers:
```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1680000000
```

### Testing Security Features

**Test Rate Limiting:**
```bash
# This should work
curl http://localhost:3000/api/activities

# Spam requests - after 100 in 15 min, you'll get 429 error
for i in {1..150}; do curl http://localhost:3000/api/activities; done
```

**Test CORS:**
```bash
# Allowed origin (should work)
curl -H "Origin: http://localhost:5173" http://localhost:3000/api/activities

# Not allowed origin (should fail)
curl -H "Origin: http://malicious-site.com" http://localhost:3000/api/activities
```

**Test Security Headers:**
```bash
curl -I http://localhost:3000/api/health
# Look for headers: X-Frame-Options, X-Content-Type-Options, etc.
```

**Test Authorization:**
```bash
# Without token (viewer role by default)
curl http://localhost:3000/api/activities

# Try to delete (requires admin role - should fail)
curl -X DELETE http://localhost:3000/api/activities/1
# Response: 403 Forbidden

# With admin token (should work)
TOKEN=$(curl -s -X POST http://localhost:3000/api/test/token | jq -r '.token')
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/activities/1
```

---

### Build for Production
```bash
# Backend
# (Already production-ready, just run: node src/server.js)

# Frontend
cd petcare-client
npm run build
# Creates optimized build in dist/ folder
```

---

## 🎓 Learning Path

1. **Start**: Explore `docker-compose up` setup first
2. **Understand**: Review README.md for feature overview
3. **Debug**: Open browser dev tools (F12) to inspect network requests
4. **Modify**: Change React components and see live updates
5. **Extend**: Add new API endpoints in petcare-api
6. **Learn**: Study how filters work in filterActivities controller
7. **Deploy**: Use Docker containers for consistency

---

**Happy coding! 🎉**

For more information, see [README.md](README.md)
