# PetCare - Pet Activity Management System

A full-stack web application for tracking and managing pet activities, including veterinary visits, exercises, and other pet care events.

## 🎯 Project Overview

PetCare is a comprehensive pet management system built to help pet owners track their pets' activities and health events. The application provides real-time activity logging, filtering capabilities, and veterinary visit tracking with interval monitoring.

## ✨ Features Implemented

### 🔒 Security Features (Production-Ready)
- **Role-Based Access Control (RBAC)**: Admin, User, and Viewer roles with JWT authentication
- **HTTP Security Headers**: Helmet.js integration for Content Security Policy, X-Frame-Options, XSS protection
- **CORS Lockdown**: Restricted to specific trusted origins (configurable via environment)
- **Rate Limiting**: 
  - General API: 100 requests per 15 minutes to prevent DDoS
  - Create Operations: 20 POST requests per minute
  - Login Attempts: 5 attempts per 15 minutes
  - Admin users get unlimited rate limit access
- **JWT Authentication**: Secure token-based API access with 24-hour expiry
- **Request Payload Limits**: 10KB maximum to prevent large payload attacks
- **Compression**: gzip response compression for faster transfers

### Backend API (Node.js + Express + Prisma ORM)
- **RESTful API** with comprehensive activity management endpoints
- **CRUD Operations**: Create, Read, Update, Delete pet activities
- **Filtering System**: Filter activities by:
  - Pet name
  - Activity type
  - Date range (start and end dates)
- **Veterinary Counter**: Track vet visits and calculate days since last visit per pet
- **Database**: PostgreSQL with Prisma ORM for data persistence
- **CORS Support**: Configured for frontend communication
- **Logging Middleware**: Request logging for debugging
- **Health Check**: API health endpoint for monitoring
- **Error Handling**: Comprehensive error management and validation

### Frontend (React + Vite + Tailwind CSS)
- **Activity Form**: Create new pet activities with:
  - Pet name
  - Activity type
  - Description
  - Duration (in minutes)
  - Activity date
- **Activity List**: Display all activities with sorting (newest first)
- **Filter Bar**: Real-time filtering by pet name, activity type, and date range
- **VetCounter Component**: Display veterinary visit statistics per pet:
  - Total vet visits
  - Last vet visit date
  - Days since last vet visit
- **Activity Card**: Individual activity display with edit/delete capabilities
- **Responsive Design**: Tailwind CSS for modern, mobile-friendly UI
- **State Management**: React hooks for activity and filter state

### Infrastructure
- **Docker Containerization**: Both backend and frontend containerized
- **Docker Compose**: Multi-container orchestration with:
  - PostgreSQL database
  - Backend API
  - Frontend application
  - Health checks for all services
  - Resource limits and reservations for stability
  - Persistent PostgreSQL data storage
- **Horizontal Scaling**: Ready for Docker Swarm or Kubernetes deployment
- **Health Checks**: All services include liveness and readiness probes
- **Monitoring & Metrics**:
  - Real-time API metrics endpoint (`/api/metrics`)
  - Request tracking by method, status code, and endpoint
  - Error rate calculation and logging
  - Average response time monitoring
  - Recent error logs for debugging
- **Performance Optimization**:
  - gzip compression for all responses (1KB+ threshold)
  - Production-grade logging with Morgan HTTP logger
  - Request deduplication and caching ready infrastructure

## 📁 Project Structure

```
Pet-Care/
├── docker-compose.yml          # Multi-container orchestration
├── petcare-api/                # Backend service
│   ├── Dockerfile              # Backend container image
│   ├── package.json            # Node.js dependencies
│   ├── .env                    # Environment variables
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/         # Database migrations
│   └── src/
│       ├── app.js              # Express app setup
│       ├── server.js           # Server entry point
│       ├── controllers/        # Request handlers
│       ├── routes/             # API routes
│       ├── middleware/         # Express middleware
│       └── lib/                # Utilities (Prisma client)
└── petcare-client/             # Frontend service
    ├── Dockerfile              # Frontend container image
    ├── package.json            # React dependencies
    ├── vite.config.js          # Vite configuration
    ├── tailwind.config.js      # Tailwind CSS config
    ├── index.html
    └── src/
        ├── App.jsx             # Main React component
        ├── main.jsx            # Entry point
        ├── index.css           # Global styles
        └── components/         # React components
```

## 🗄️ Database Schema

### PetActivity Model
```prisma
model PetActivity {
  id            Int       @id @default(autoincrement())
  petName       String    @db.VarChar(50)
  activityType  String
  description   String?   @db.VarChar(500)
  duration      Int?
  activityDate  DateTime  @default(now())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## 🔌 API Endpoints

### Health & Monitoring
- **GET** `/api/health` - API health check
- **GET** `/api/metrics` - Real-time metrics and monitoring data (requires auth)

### Authentication (Development)
- **POST** `/api/test/token` - Generate test JWT token (development only)
  - Returns: `{ token, message, usage }`
  - Usage: Add to header: `Authorization: Bearer <token>`

### Activities
- **GET** `/api/activities` - Get all activities (rate limited: 60/min)
- **POST** `/api/activities` - Create new activity (rate limited: 20/min, requires user/admin role)
- **GET** `/api/activities/filter?activityType=VET_VISIT&petName=Buddy&startDate=2026-01-01&endDate=2026-12-31` - Filter activities (rate limited: 60/min)
- **GET** `/api/activities/:id` - Get activity by ID (rate limited: 60/min)
- **PUT** `/api/activities/:id` - Update activity (requires user/admin role)
- **DELETE** `/api/activities/:id` - Delete activity (requires admin role)

### Statistics
- **GET** `/api/activities/vet-counter/:petName` - Get vet visit stats for a pet (rate limited: 60/min)

## 🔐 Authentication & Authorization

### Roles
- **Admin**: Full access to all endpoints, create/update/delete activities, unlimited rate limits
- **User**: Can read all activities and create new ones
- **Viewer** (default): Read-only access

### Getting Started with Authentication
1. **Development**: Call `POST /api/test/token` to get a test JWT token with admin role
2. **Production**: Implement proper user login with secure token generation
3. **Usage**: Add token to request header: `Authorization: Bearer <your-jwt-token>`

### Role-Based Endpoint Access
| Endpoint | GET | POST | PUT | DELETE |
|----------|-----|------|-----|--------|
| `/api/activities` | Any | User+ | - | - |
| `/api/activities/:id` | Any | - | User+ | Admin |
| Operations affecting others | - | User+ | User+ | Admin |

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development auto-reload
- **dotenv** - Environment variables

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS transformation

### DevOps
- **Docker** - Container runtime
- **Docker Compose** - Container orchestration

## 🚀 Getting Started

### Quick Start with Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd Pet-Care

# Start all services with Docker Compose
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# Database: localhost:5432
```

### For Detailed Local Setup
See [SETUP.md](SETUP.md) for step-by-step instructions for setting up on a new computer without Docker.

## 📝 Key Implementation Details

### Request Validation
- All required fields are validated at the controller level
- Proper HTTP status codes returned (400, 404, 500)
- Meaningful error messages for debugging

### Date Handling
- All dates stored in ISO format
- `parseDate()` utility for safe date parsing
- Date range filtering with gte/lte operators

### Activity Filtering
- Case-insensitive filtering using Prisma's `insensitive` mode
- Supports partial string matching with `contains`
- Chainable filters (combine multiple criteria)

### Pet Statistics
- VetCounter calculates total visits and days since last visit
- Useful for monitoring pet health schedules

## 🧪 Testing the API

### Generate Test Token (Development)
```bash
curl -X POST http://localhost:3000/api/test/token
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Test token generated (development only)",
  "usage": "Add to request header: Authorization: Bearer <token>"
}
```

### Create an activity (with authentication)
```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "petName": "Buddy",
    "activityType": "EXERCISE",
    "description": "Morning walk",
    "duration": 30
  }'
```

### Filter by activity type
```bash
curl "http://localhost:3000/api/activities/filter?activityType=VET_VISIT"
```

### Get vet visit stats
```bash
curl http://localhost:3000/api/activities/vet-counter/Buddy
```

### Check API Metrics
```bash
curl http://localhost:3000/api/metrics
```

Output includes:
- Total requests
- Error rate
- Average response time
- Requests by method and status code
- Recent error logs

## 🔐 Security Deep Dive

## � Security Deep Dive

### 1. Rate Limiting Protection
Prevents API from being overwhelmed by too many requests:

**Rate Limits by Endpoint:**
| Type | Limit | Window |
|------|-------|--------|
| General API | 100 | 15 min |
| Create Activity (POST) | 20 | 1 min |
| Login Attempts | 5 | 15 min |
| Read Operations (GET) | 60 | 1 min |
| Admin Users | Unlimited | N/A |

**Response when limit exceeded:**
```json
{
  "error": "Too many requests",
  "retryAfter": 1234567890
}
```

### 2. HTTP Security Headers (Helmet.js)
Adds essential security headers to every response:
- **Content-Security-Policy**: Prevents inline scripts and XSS attacks
- **X-Frame-Options: DENY**: Prevents clickjacking attacks
- **X-Content-Type-Options: nosniff**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables browser XSS protection
- **Referrer-Policy**: Restricts referrer information leaks

### 3. CORS Lockdown
Only allows requests from trusted origins:

**Configuration in `.env`:**
```
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

**For Production:**
```
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

**Allowed Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS
**Credentials:** Supported with same-origin policy

### 4. JWT Role-Based Access Control
Secure authentication with role-based permissions:

**Token Structure:**
```json
{
  "userId": "user-123",
  "role": "admin",
  "timestamp": 1680000000,
  "iat": 1680000000,
  "exp": 1680086400
}
```

**Roles & Permissions:**
- **Admin**: Create, read, update, delete any activity
- **User**: Create, read, update own activities
- **Viewer**: Read-only access

**Implementing in Production:**
1. Create login endpoint
2. Verify credentials against secure user database
3. Generate JWT with appropriate role
4. Client stores token in secure httpOnly cookie or localStorage
5. Include token in Authorization header for all requests

### 5. Request Payload Validation
- Maximum payload size: 10KB
- Prevents large upload attacks
- Configurable in `app.js`

### 6. Response Compression
- gzip compression enabled for responses >1KB
- Reduces bandwidth and improves performance
- Automatically applied to all responses

### 7. Comprehensive Error Handling
- No sensitive information in error messages
- Stack traces hidden in production
- All errors logged with timestamps
- Validation errors returned with clear messages

### 8. Monitoring & Metrics
Tracks all API activity for security monitoring:

**Metrics Collected:**
- Total requests and errors
- Requests by method and status code
- Error rate percentage
- Average response time
- Errors by endpoint
- Last 1000 requests

**Access Metrics:**
```bash
curl http://localhost:3000/api/metrics
```

**Monitoring in Production:**
1. Regularly check `/api/metrics`
2. Alert on high error rates (>5%)
3. Alert on slow responses (>1000ms average)
4. Review recent errors for patterns
5. Track rate limit breaches per IP

## 🚀 Deployment & Scaling

### Development Setup
```bash
# Start with default development settings
docker-compose up -d
```

Default ports:
- Frontend: 5173
- Backend: 3000
- Database: 5432

### Production Deployment

**1. Update Environment Variables:**
```bash
# Create .env file in petcare-api/
JWT_SECRET=your-super-secret-key-min-32-chars
CORS_ORIGINS=https://yourdomain.com
NODE_ENV=production
```

**2. Build Docker Images:**
```bash
docker-compose build --no-cache
```

**3. Push to Registry:**
```bash
docker tag petcare:latest myregistry/petcare:1.0.0
docker push myregistry/petcare:1.0.0
```

**4. Deploy with Health Checks:**
Docker Compose now includes:
- Health checks for all services
- Resource limits (CPU/Memory)
- Restart policies
- Logging configuration

### Horizontal Scaling

**Docker Swarm (Simple):**
```bash
docker swarm init
docker stack deploy -c docker-compose.yml petcare

# Scale backend to 3 instances
docker service scale petcare_backend=3
```

**Kubernetes (Enterprise):**
```bash
kubectl apply -f kubernetes-deployment.yaml

# Scale to 5 replicas
kubectl scale deployment petcare-backend --replicas=5
```

**Load Balancing:** 
For multiple backend instances, place behind:
- nginx reverse proxy
- HAProxy
- AWS ELB/ALB
- Google Cloud Load Balancer

### Monitoring in Production
1. **Application Metrics**: Use `/api/metrics` endpoint
2. **Container Metrics**: Use `docker stats petcare-api`
3. **Database Performance**: Monitor PostgreSQL logs
4. **External Monitoring**: Integrate with DataDog, New Relic, or Prometheus

## �📊 Development Notes

### CORS Configuration
- Only allows requests from `http://localhost:5173` (frontend)
- Needed when frontend and backend run on different ports
- Can be modified in `petcare-api/src/app.js` for production

### Database Migrations
- Located in `petcare-api/prisma/migrations/`
- Initial migration: `20260408073624_init` - creates pet_activities table
- New migrations auto-generated when schema changes

### Logging
- Request logging middleware tracks all API calls
- Helpful for debugging and monitoring

## 🐛 Troubleshooting

### Port Already in Use
- Backend: 3000
- Frontend: 5173
- Database: 5432

Kill existing processes or modify docker-compose.yml ports.

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker-compose logs postgres`
- Check DATABASE_URL environment variable matches container connection string

### CORS Errors
- Verify frontend is running on port 5173
- Check app.js CORS configuration allows the frontend origin

## 🔄 Development Workflow

1. **Backend Development**
   - Run: `npm run dev` (from petcare-api)
   - Uses nodemon for auto-reload
   - Test with curl or Postman

2. **Frontend Development**
   - Run: `npm run dev` (from petcare-client)
   - Hot module replacement enabled
   - Visit http://localhost:5173

3. **Database Changes**
   - Modify `prisma/schema.prisma`
   - Run: `npm run prisma migrate dev -- --name <migration_name>`
   - Creates and applies migration

## 📦 Production Deployment

The project is containerized and ready for deployment:
- Build images: `docker-compose build`
- Push to registry (Docker Hub, ECR, etc.)
- Deploy to container orchestration platform (Kubernetes, ECS, etc.)

## 📄 License

This project is part of a workshop for learning full-stack development.

## 👥 Author

Created as a hands-on learning project for full-stack web development with Docker.

---

For detailed setup instructions on a new computer, see [SETUP.md](SETUP.md)
