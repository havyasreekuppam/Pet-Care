// Monitoring and metrics middleware
class MetricsCollector {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      totalResponseTime: 0,
      requestsByMethod: {},
      requestsByStatus: {},
      errorsByEndpoint: {},
      averageResponseTime: 0
    };
    this.requestLog = [];
  }

  recordRequest(method, statusCode, responseTime, endpoint, error = null) {
    // Update totals
    this.metrics.totalRequests++;
    this.metrics.totalResponseTime += responseTime;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.totalRequests;

    // Track by method
    this.metrics.requestsByMethod[method] = (this.metrics.requestsByMethod[method] || 0) + 1;

    // Track by status code
    this.metrics.requestsByStatus[statusCode] = (this.metrics.requestsByStatus[statusCode] || 0) + 1;

    // Track errors
    if (statusCode >= 400) {
      this.metrics.totalErrors++;
      this.metrics.errorsByEndpoint[endpoint] = (this.metrics.errorsByEndpoint[endpoint] || 0) + 1;
      if (error) {
        console.error(`[${new Date().toISOString()}] Error on ${method} ${endpoint}: ${error}`);
      }
    }

    // Keep last 1000 requests
    this.requestLog.push({
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`,
      error: error || null
    });

    if (this.requestLog.length > 1000) {
      this.requestLog.shift();
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      errorRate: ((this.metrics.totalErrors / this.metrics.totalRequests) * 100 || 0).toFixed(2) + '%',
      uptime: process.uptime().toFixed(0) + 's'
    };
  }

  getRecentLogs(limit = 50) {
    return this.requestLog.slice(-limit);
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      totalResponseTime: 0,
      requestsByMethod: {},
      requestsByStatus: {},
      errorsByEndpoint: {},
      averageResponseTime: 0
    };
  }
}

export const metricsCollector = new MetricsCollector();

// Middleware to collect metrics
export const monitoringMiddleware = (req, res, next) => {
  const startTime = Date.now();

  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function (data) {
    const responseTime = Date.now() - startTime;
    metricsCollector.recordRequest(
      req.method,
      res.statusCode,
      responseTime,
      req.path
    );
    return originalSend.call(this, data);
  };

  res.json = function (data) {
    const responseTime = Date.now() - startTime;
    metricsCollector.recordRequest(
      req.method,
      res.statusCode,
      responseTime,
      req.path
    );
    return originalJson.call(this, data);
  };

  next();
};

// Metrics endpoint - returns all collected metrics
export const metricsHandler = (req, res) => {
  res.status(200).json({
    metrics: metricsCollector.getMetrics(),
    recentErrors: metricsCollector.getRecentLogs(20)
  });
};
