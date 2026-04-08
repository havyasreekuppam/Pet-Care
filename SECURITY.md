# PetCare - Security & Deployment Guide

Complete documentation of all security features and production deployment strategies.

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Authentication & Authorization](#authentication--authorization)
3. [Rate Limiting](#rate-limiting)
4. [HTTP Security Headers](#http-security-headers)
5. [CORS Configuration](#cors-configuration)
6. [Monitoring & Metrics](#monitoring--metrics)
7. [Deployment Strategies](#deployment-strategies)
8. [Production Checklist](#production-checklist)

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

## Authentication & Authorization

### JWT (JSON Web Token) Strategy

#### Token Structure
```json
{
  "userId": "user-123",
  "role": "admin",
  "timestamp": 1680000000,
  "iat": 1680000000,       // Issued at
  "exp": 1680086400        // Expires at (24 hours)
}
```

#### Roles & Permission Matrix

| Resource | Admin | User | Viewer |
|----------|-------|------|--------|
| GET all activities | ✓ | ✓ | ✓ |
| GET activity by ID | ✓ | ✓ | ✓ |
| POST (create) | ✓ | ✓ | ✗ |
| PUT (update own) | ✓ | ✓ | ✗ |
| PUT (update others) | ✓ | ✗ | ✗ |
| DELETE (own) | ✓ | ✓ | ✗ |
| DELETE (others) | ✓ | ✗ | ✗ |
| View metrics | ✓ | ✗ | ✗ |

#### Implementation in Production

**1. User Registration**
```javascript
POST /auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "User Name"
}

// Hash password with bcrypt
// Create user in database
// Return JWT token
```

**2. User Login**
```javascript
POST /auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Verify password against hash
// Generate JWT token
// Return token
```

**3. Token Usage**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/api/activities
```

**4. Token Refresh**
```javascript
// Implement refresh token endpoint
POST /auth/refresh
{
  "refreshToken": "long-lived-refresh-token"
}

// Verify refresh token
// Generate new JWT token
// Optional: Revoke old token
```

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

## Deployment Strategies

### Development Deployment

```bash
docker-compose up -d
```

**Characteristics:**
- All in one compose file
- Database accessible directly
- No authentication on health checks
- Development logging enabled

### Production Deployment - Docker Swarm

```bash
# Initialize swarm mode
docker swarm init

# Create secrets
echo "production-secret-key-min-32-chars" | \
  docker secret create jwt_secret -

# Deploy stack
docker stack deploy -c production-compose.yml petcare
```

**Characteristics:**
- Multi-host deployment
- Encrypted secrets management
- Service discovery
- Load balancing built-in

### Production Deployment - Kubernetes

```bash
# Create namespace
kubectl create namespace petcare

# Create secrets
kubectl create secret generic petcare-secrets \
  --from-literal=jwt-secret="production-secret-key" \
  -n petcare

# Deploy
kubectl apply -f k8s-deployment.yml -n petcare

# Scale backend
kubectl scale deployment petcare-backend --replicas=5 -n petcare
```

**Characteristics:**
- Cloud-native orchestration
- Auto-healing and auto-scaling
- Rolling updates
- Persistent volumes for database

### Production Deployment - Container Registry

**1. Build and Push to Docker Hub:**
```bash
# Build image
docker build -t yourusername/petcare-api:1.0.0 ./petcare-api

# Push to registry
docker push yourusername/petcare-api:1.0.0

# In docker-compose.yml, use image instead of build
services:
  backend:
    image: yourusername/petcare-api:1.0.0
```

**2. Deploy to Production Server:**
```bash
# SSH into production server
ssh user@prod-server.com

# Pull latest image
docker pull yourusername/petcare-api:1.0.0

# Stop old container
docker-compose down

# Start new container
docker-compose up -d
```

---

## Production Checklist

### Pre-Deployment

- [ ] **JWT Secret**
  - [ ] Generate secure secret: `openssl rand -base64 32`
  - [ ] Update in `.env`
  - [ ] Store in secure vault (AWS Secrets Manager, HashiCorp Vault)

- [ ] **Database**
  - [ ] Change default password from `workshop123`
  - [ ] Use AWS RDS, Google Cloud SQL, or managed PostgreSQL
  - [ ] Enable automatic backups (daily minimum)
  - [ ] Enable encrypted connections
  - [ ] Configure backup restore procedures

- [ ] **CORS Configuration**
  - [ ] Update `CORS_ORIGINS` to production domain
  - [ ] Remove localhost origins
  - [ ] Support all your app subdomains

- [ ] **HTTPS/TLS**
  - [ ] Obtain SSL certificate (Let's Encrypt is free)
  - [ ] Configure reverse proxy (nginx/HAProxy)
  - [ ] Enable HSTS (HTTP Strict Transport Security)
  - [ ] Redirect HTTP → HTTPS

- [ ] **Environment**
  - [ ] Set `NODE_ENV=production`
  - [ ] Disable debugging endpoints (`POST /api/test/token`)
  - [ ] Configure logging service (ELK/Splunk)

### Deployment

- [ ] **Build & Test**
  - [ ] Build Docker images: `docker build -t app:1.0.0 .`
  - [ ] Run security scan: `trivy image app:1.0.0`
  - [ ] Tag image: `docker tag app:1.0.0 registry.com/app:1.0.0`
  - [ ] Push to registry: `docker push registry.com/app:1.0.0`

- [ ] **Health Checks**
  - [ ] Test health endpoint: `curl https://api.yourdomain.com/api/health`
  - [ ] Verify all services running: `docker-compose ps`
  - [ ] Check database connection: `curl https://api.yourdomain.com/api/metrics`

- [ ] **Monitoring Setup**
  - [ ] Configure error tracking (Sentry, DataDog)
  - [ ] Set up performance monitoring (New Relic, Datadog)
  - [ ] Configure uptime monitoring (Pingdom, UptimeRobot)
  - [ ] Set up log aggregation (CloudWatch, ELK Stack)

- [ ] **Backup & Disaster Recovery**
  - [ ] Verify database backups are running
  - [ ] Test backup restoration
  - [ ] Document recovery procedures
  - [ ] Create runbook for common issues

### Post-Deployment

- [ ] **Verify Operation**
  - [ ] Check API response times: `GET /api/metrics`
  - [ ] Verify error rate < 1%
  - [ ] Test all critical flows in UI
  - [ ] Monitor error logs for issues

- [ ] **Security Validation**
  - [ ] Verify HTTPS working: `curl -I https://api.yourdomain.com/api/health`
  - [ ] Check security headers: `curl -I https://api.yourdomain.com/api/health`
  - [ ] Test CORS: `curl -H "Origin: https://attacker.com" ...`
  - [ ] Verify rate limiting: Send 100+ requests from same IP

- [ ] **Scale Testing**
  - [ ] Load test: 1000 requests/sec
  - [ ] Verify rate limits kick in correctly
  - [ ] Check database performance under load
  - [ ] Monitor CPU/Memory usage

---

## Troubleshooting Production Issues

### High Error Rate

**Symptoms:** `/api/metrics` shows >5% error rate

**Investigation:**
```bash
# Check backend logs
docker logs petcare-api | tail -100

# Check database connection
docker exec petcare-postgres psql -U workshop -d petcare -c "SELECT 1"

# Check disk space
df -h

# Check memory
free -m
```

**Solutions:**
1. Restart backend: `docker-compose restart backend`
2. Check database connectivity
3. Scale up resources
4. Review recent code changes

### Slow API Responses

**Symptoms:** Average response time > 500ms

**Investigation:**
```bash
# Check metrics
curl http://localhost:3000/api/metrics

# Identify slow endpoints from recentErrors

# Check database query performance
EXPLAIN ANALYZE SELECT * FROM pet_activities WHERE petName LIKE 'Buddy%';

# Check system resources
docker stats
```

**Solutions:**
1. Add database indexes
2. Scale up CPU/memory
3. Enable caching
4. Optimize queries

### Rate Limit Abuse

**Symptoms:** Many 429 responses in logs

**Investigation:**
```bash
# Check which IPs are hitting limits
docker logs petcare-api | grep 429

# Check metrics endpoint
curl http://localhost:3000/api/metrics
```

**Solutions:**
1. Increase rate limits if legitimate traffic
2. Block IP if malicious
3. Implement CAPTCHA on frontend
4. Contact users about rate limits

---

## Security References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Docker Security](https://docs.docker.com/engine/security/)

---

**Last Updated:** April 8, 2026
**Version:** 1.0.0
