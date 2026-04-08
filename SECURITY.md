# PetCare - Security & Implementation Guide

Documentation of security features implemented in the PetCare application.

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Rate Limiting](#rate-limiting)
3. [HTTP Security Headers](#http-security-headers)
4. [CORS Configuration](#cors-configuration)
5. [Monitoring & Metrics](#monitoring--metrics)
6. [Docker Deployment](#docker-deployment)
7. [Production Checklist](#production-checklist)

---

## Security Architecture

### Defense in Depth

PetCare implements multiple layers of security:

```
┌─────────────────────────────────────────┐
│         Client Applications             │
│   (Browser/Mobile/Desktop)              │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │   CORS Check    │  Layer 1: Origin validation
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ Rate Limiting   │  Layer 2: Request throttling
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ Authentication  │  Layer 3: JWT verification
        │  (JWT Token)    │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ Authorization   │  Layer 4: Role-based access
        │     (RBAC)      │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ Payload Check   │  Layer 5: Size & validation
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ API Endpoint    │  Layer 6: Business logic
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ HTTP Headers    │  Layer 7: Security headers
        │   (Helmet)      │
        └─────────────────┘
```

---

## JWT Authentication (Development)

### Token Structure
```json
{
  "userId": "user-123",
  "role": "admin",
  "timestamp": 1680000000,
  "iat": 1680000000,
  "exp": 1680086400
}
```

### Generating Test Tokens

In development mode, you can generate JWT tokens at:
```bash
POST /api/test/token
{
  "userId": "test-user",
  "role": "admin"
}
```

Response: `{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }`

### Using Tokens

Include the token in request headers:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/api/activities
```

### Implementation Files

**Middleware**: `petcare-api/src/middleware/auth.js`
- `generateToken()` - Creates JWT tokens
- `verifyToken()` - Validates tokens
- `authenticate()` - Middleware to check if token exists
- `authorize()` - Middleware to check user role

**Files**: `petcare-api/src/app.js`
- Token generation endpoint: `POST /api/test/token`

---

## Rate Limiting

### Why Rate Limiting?

Prevents:
- **DDoS Attacks**: Limit requests per IP/user
- **API Abuse**: Prevent scraping and excessive usage
- **Resource Exhaustion**: Protect database and servers
- **Brute Force**: Limit login attempts

### Configuration

**File**: `petcare-api/src/middleware/rateLimiter.js`

### Rate Limit Tiers

#### General Rate Limiter (All Routes)
```javascript
windowMs: 15 * 60 * 1000,  // 15 minutes
max: 100,                  // requests
```
- 100 requests per 15 minutes per IP
- Resets every 15 minutes
- Health check endpoint skipped

#### Create/Write Operations
```javascript
windowMs: 1 * 60 * 1000,   // 1 minute
max: 20,                   // requests
```
- Limited to prevent spam/abuse
- Uses user ID if authenticated
- Falls back to IP if anonymous

#### Read-Only Operations
```javascript
windowMs: 1 * 60 * 1000,   // 1 minute
max: 60,                   // requests
```
- More lenient for reading data
- Admin users bypass completely

### Rate Limit Response Headers

```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1680000000
Retry-After: 900
```

### Adjusting Rate Limits

**In Production:**

```bash
# Moderate API usage
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200

# Strict (under attack)
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=50

# Relaxed (high-volume app)
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=1000
```

---

## HTTP Security Headers

### Helmet.js Configuration

**File**: `petcare-api/src/app.js`

### Implemented Headers

#### 1. Content-Security-Policy (CSP)
```
Content-Security-Policy: default-src 'self'; 
style-src 'self' 'unsafe-inline'; 
script-src 'self'; 
img-src 'self' data: https:
```
- Prevents inline scripts (stops XSS)
- Only allows resources from trusted sources
- Restricts style and image loading

#### 2. X-Frame-Options
```
X-Frame-Options: DENY
```
- Prevents page from being framed in iframes
- Stops clickjacking attacks

#### 3. X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
- Prevents browser MIME type sniffing
- Enforces Content-Type header

#### 4. X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
- Enables browser's XSS filter
- Blocks page if XSS detected

#### 5. Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
- Limits referrer information sent to other sites
- Prevents leaking internal URLs

---

## CORS Configuration

### Why CORS?

Modern browsers block cross-origin requests for security. CORS (Cross-Origin Resource Sharing) allows controlled access.

### Configuration

**File**: `petcare-api/src/app.js`

**Environment Variable**: `.env`
```
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### Allowed Configuration

```javascript
cors({
  origin: corsOrigins,        // Only these origins
  credentials: true,          // Allow cookies/auth
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400              // 24 hour preflight cache
})
```

### Multiple Origins (Safe Approach)

```
CORS_ORIGINS=https://app.yourdomain.com,https://admin.yourdomain.com,https://mobile.yourdomain.com
```

### Unsafe Approach (NOT for Production)

```javascript
// ❌ DO NOT DO THIS IN PRODUCTION
cors({ origin: '*' })
```

---

## Monitoring & Metrics

### Real-Time Metrics Endpoint

```bash
GET /api/metrics
```

### Response Format

```json
{
  "metrics": {
    "totalRequests": 1523,
    "totalErrors": 12,
    "errorRate": "0.79%",
    "totalResponseTime": 45230,
    "averageResponseTime": 29.69,
    "uptime": "3600",
    "requestsByMethod": {
      "GET": 1200,
      "POST": 200,
      "PUT": 100,
      "DELETE": 23
    },
    "requestsByStatus": {
      "200": 1489,
      "201": 15,
      "400": 8,
      "429": 4,
      "500": 7
    },
    "errorsByEndpoint": {
      "/api/activities/999": 5,
      "/api/activities": 7
    }
  },
  "recentErrors": [
    {
      "timestamp": "2026-04-08T12:34:56.789Z",
      "method": "GET",
      "endpoint": "/api/activities/999",
      "statusCode": 404,
      "responseTime": "2.45ms",
      "error": "Activity not found"
    }
  ]
}
```

### Metrics to Monitor

**Health Indicators:**
- **Error Rate**: Should stay < 1%
- **Average Response Time**: Should be < 100ms
- **Rate Limit Hits**: Should be rare (< 10/hour)

**Performance Indicators:**
- **Request Distribution**: Know your traffic pattern
- **Slow Endpoints**: Anything > 200ms needs investigation
- **Error Types**: Identify patterns (404s, 500s, 429s)

### Setting Up Alerts

**Error Rate Spike:**
```
IF error_rate > 5% THEN alert("High error rate detected")
```

**High Response Time:**
```
IF avg_response_time > 500ms THEN alert("Slow API responses")
```

**Rate Limit Abuse:**
```
IF rate_limit_429_count > 100/hour THEN alert("API being hammered")
```

---

## Docker Deployment

### Development Deployment

```bash
docker-compose up -d
```

**Services:**
- PostgreSQL 16 (Database)
- Backend API (Node.js Express)
- Frontend (Vite React)

**Features:**
- Health checks on all services
- Resource limits (CPU & memory)
- Persistent volume for database
- Environment variables configured
- Logging with json-file driver

### Environment Variables

Create `.env` file in `petcare-api`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://workshop:workshop123@postgres:5432/petcare

# Security
JWT_SECRET=your-secret-key-min-32-chars

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Docker Compose File Structure

**File**: `docker-compose.yml`

Services configured:
1. **PostgreSQL** - Database with health check
2. **Backend** - API server with health check  
3. **Frontend** - React app with health check

Health checks verify:
- PostgreSQL: `pg_isready` command
- Backend: `curl /api/health`
- Frontend: `curl localhost`

---

## Production Checklist

### Pre-Deployment

- [ ] **JWT Secret**
  - [ ] Generate: `openssl rand -base64 32`
  - [ ] Set in `.env` as `JWT_SECRET`
  - [ ] Never commit to git

- [ ] **Database Security**
  - [ ] Change password from default `workshop123`
  - [ ] Use strong password (12+ chars, mixed case, numbers)

- [ ] **CORS Configuration**
  - [ ] Update `CORS_ORIGINS` to your domain
  - [ ] Remove localhost origins in production
  - [ ] Separate development and production configurations

- [ ] **Rate Limiting**
  - [ ] Review rate limits in ratio limiter middleware
  - [ ] Adjust for expected traffic volume
  - [ ] Consider IP-based vs authenticated user limits

### Deployment

- [ ] **Environment Setup**
  - [ ] Set `NODE_ENV=production`
  - [ ] Disable test endpoints (`POST /api/test/token`)
  - [ ] Configure error logging service

- [ ] **Health Checks**
  - [ ] Verify all services running: `docker-compose ps`
  - [ ] Test health endpoint: `curl http://localhost:3000/api/health`
  - [ ] Check metrics: `curl http://localhost:3000/api/metrics`

### Post-Deployment

- [ ] **Verify Operation**
  - [ ] Test API endpoints working
  - [ ] Check error logs for issues
  - [ ] Monitor error rate (should be < 1%)

- [ ] **Security Validation**
  - [ ] Verify security headers: `curl -I http://localhost:3000/api/health`
  - [ ] Test CORS: `curl -H "Origin: http://other-domain.com" ...`
  - [ ] Verify rate limiting: Send 150+ requests from same IP

- [ ] **Performance Monitoring**
  - [ ] Check average response time: `GET /api/metrics`
  - [ ] Monitor request distribution
  - [ ] Track error types and trends

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Verify database connection
docker-compose logs postgres

# Check environment variables
docker-compose exec backend env | grep DATABASE
```

### High Error Rate

**Check metrics:**
```bash
curl http://localhost:3000/api/metrics
```

**Investigation:**
- Review recent code changes
- Check database connectivity
- Monitor system resources (CPU, memory, disk)
- Check frontend for request errors

### Rate Limiting Issues

**Symptoms:** Getting 429 (Too Many Requests) responses

**Solutions:**
1. Increase rate limit windows/max in `.env`
2. Check if legitimate high traffic
3. Verify rate limiter files deployed correctly
4. Review logs for IP patterns

### CORS Errors

**Symptoms:** Browser console shows CORS error

**Solutions:**
1. Verify frontend URL in `CORS_ORIGINS`
2. Check exact protocol (http vs https)
3. Check port number matches
4. Review CORS configuration in `app.js`

---

## Security Implementation Files

**Core Security Middleware:**
- `petcare-api/src/middleware/auth.js` - JWT token management
- `petcare-api/src/middleware/rateLimiter.js` - Rate limiting logic
- `petcare-api/src/middleware/monitoring.js` - Metrics collection

**Main Application:**
- `petcare-api/src/app.js` - Helmet, CORS, middleware integration

**Configuration:**
- `.env` - Environment variables
- `docker-compose.yml` - Health checks and resource limits

---
