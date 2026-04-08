import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'petcare-secret-key-change-in-production';

// Generate JWT token
export const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { userId, role, timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware to authenticate requests
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  // Allow unauthenticated access for now, but attach user info if token exists
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  // Default unauthenticated user
  if (!req.user) {
    req.user = { userId: 'anonymous', role: 'viewer' };
  }

  next();
};

// Middleware to check user role
export const authorize = (requiredRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - No user context' });
    }

    const userRole = req.user.role || 'viewer';
    const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Forbidden - Required role: ${allowedRoles.join(', ')}, your role: ${userRole}`
      });
    }

    next();
  };
};
