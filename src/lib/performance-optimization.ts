/**
 * Performance Optimization Engine
 * Advanced caching, query optimization, and system performance monitoring
 */

import { sql } from './neon';

export interface CacheConfig {
  key: string;
  data: unknown;
  ttl: number; // Time to live in seconds
  tags?: string[]; // For cache invalidation
  compression?: boolean;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cacheHitRate: number;
  databaseQueryTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface QueryOptimization {
  query: string;
  executionTime: number;
  rowsExamined: number;
  rowsReturned: number;
  indexesUsed: string[];
  optimizationSuggestions: string[];
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastHealthCheck: string;
  services: Array<{
    name: string;
    status: 'up' | 'down' | 'degraded';
    responseTime: number;
    lastCheck: string;
  }>;
  alerts: Array<{
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
}

// In-memory cache for high-performance operations
const memoryCache = new Map<string, { data: unknown; expires: number; tags: string[] }>();
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0
};

/**
 * Initialize performance optimization tables
 */
export async function initializePerformanceOptimizationTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping performance optimization table initialization');
      return;
    }

    // Performance metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(15,4) NOT NULL,
        metric_unit VARCHAR(20),
        endpoint VARCHAR(255),
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )
    `;

    // Query performance table
    await sql`
      CREATE TABLE IF NOT EXISTS query_performance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        query_hash VARCHAR(64) NOT NULL,
        query_text TEXT NOT NULL,
        execution_time_ms DECIMAL(10,3) NOT NULL,
        rows_examined INTEGER,
        rows_returned INTEGER,
        indexes_used TEXT[],
        timestamp TIMESTAMP DEFAULT NOW(),
        optimization_applied BOOLEAN DEFAULT false
      )
    `;

    // Cache performance table
    await sql`
      CREATE TABLE IF NOT EXISTS cache_performance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cache_key VARCHAR(255) NOT NULL,
        cache_type VARCHAR(50) NOT NULL,
        operation VARCHAR(20) NOT NULL, -- hit, miss, set, delete
        response_time_ms DECIMAL(8,3),
        data_size_bytes INTEGER,
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `;

    // System health checks table
    await sql`
      CREATE TABLE IF NOT EXISTS system_health_checks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_name VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL,
        response_time_ms DECIMAL(8,3),
        error_message TEXT,
        timestamp TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )
    `;

    // Performance alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS performance_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        threshold_value DECIMAL(15,4),
        actual_value DECIMAL(15,4),
        resolved BOOLEAN DEFAULT false,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Database cache table (for persistent caching)
    await sql`
      CREATE TABLE IF NOT EXISTS database_cache (
        cache_key VARCHAR(255) PRIMARY KEY,
        cache_data JSONB NOT NULL,
        cache_tags TEXT[] DEFAULT '{}',
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        accessed_at TIMESTAMP DEFAULT NOW(),
        access_count INTEGER DEFAULT 1
      )
    `;

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_time ON performance_metrics(metric_name, timestamp)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_query_performance_hash ON query_performance(query_hash)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_query_performance_time ON query_performance(execution_time_ms DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cache_performance_key ON cache_performance(cache_key)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cache_performance_timestamp ON cache_performance(timestamp)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_system_health_service ON system_health_checks(service_name, timestamp)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_performance_alerts_type ON performance_alerts(alert_type, created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_database_cache_expires ON database_cache(expires_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_database_cache_tags ON database_cache USING GIN(cache_tags)`;

    console.log('✅ Performance optimization tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize performance optimization tables:', error);
  }
}

/**
 * Multi-layer cache system
 */
export class CacheManager {
  /**
   * Get data from cache (memory first, then database)
   */
  static async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      // Check memory cache first
      const memoryResult = memoryCache.get(key);
      if (memoryResult && memoryResult.expires > Date.now()) {
        cacheStats.hits++;
        await this.recordCacheOperation(key, 'memory', 'hit', Date.now() - startTime);
        return memoryResult.data as T;
      }

      // Check database cache
      if (sql) {
        const dbResult = await sql`
          SELECT cache_data, expires_at FROM database_cache 
          WHERE cache_key = ${key} AND expires_at > NOW()
        ` as Array<{ cache_data: T; expires_at: string }>;

        if (dbResult.length > 0) {
          cacheStats.hits++;
          
          // Update access statistics
          await sql`
            UPDATE database_cache 
            SET accessed_at = NOW(), access_count = access_count + 1
            WHERE cache_key = ${key}
          `;

          // Also store in memory cache for faster future access
          memoryCache.set(key, {
            data: dbResult[0].cache_data,
            expires: new Date(dbResult[0].expires_at).getTime(),
            tags: []
          });

          await this.recordCacheOperation(key, 'database', 'hit', Date.now() - startTime);
          return dbResult[0].cache_data;
        }
      }

      cacheStats.misses++;
      await this.recordCacheOperation(key, 'memory', 'miss', Date.now() - startTime);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      cacheStats.misses++;
      return null;
    }
  }

  /**
   * Set data in cache (both memory and database)
   */
  static async set(config: CacheConfig): Promise<void> {
    const startTime = Date.now();
    
    try {
      const expires = Date.now() + (config.ttl * 1000);
      const expiresDate = new Date(expires);

      // Set in memory cache
      memoryCache.set(config.key, {
        data: config.data,
        expires,
        tags: config.tags || []
      });

      // Set in database cache for persistence
      if (sql) {
        await sql`
          INSERT INTO database_cache (cache_key, cache_data, cache_tags, expires_at)
          VALUES (${config.key}, ${JSON.stringify(config.data)}, ${config.tags || []}, ${expiresDate.toISOString()})
          ON CONFLICT (cache_key) DO UPDATE SET
            cache_data = EXCLUDED.cache_data,
            cache_tags = EXCLUDED.cache_tags,
            expires_at = EXCLUDED.expires_at,
            accessed_at = NOW(),
            access_count = database_cache.access_count + 1
        `;
      }

      cacheStats.sets++;
      await this.recordCacheOperation(config.key, 'memory', 'set', Date.now() - startTime, JSON.stringify(config.data).length);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete from cache
   */
  static async delete(key: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Delete from memory cache
      memoryCache.delete(key);

      // Delete from database cache
      if (sql) {
        await sql`DELETE FROM database_cache WHERE cache_key = ${key}`;
      }

      cacheStats.deletes++;
      await this.recordCacheOperation(key, 'memory', 'delete', Date.now() - startTime);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Invalidate cache by tags
   */
  static async invalidateByTags(tags: string[]): Promise<void> {
    try {
      // Clear from memory cache
      for (const [key, value] of memoryCache.entries()) {
        if (value.tags.some(tag => tags.includes(tag))) {
          memoryCache.delete(key);
        }
      }

      // Clear from database cache
      if (sql) {
        await sql`
          DELETE FROM database_cache 
          WHERE cache_tags && ${tags}
        `;
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): typeof cacheStats & { hitRate: number; memorySize: number } {
    const total = cacheStats.hits + cacheStats.misses;
    const hitRate = total > 0 ? (cacheStats.hits / total) * 100 : 0;
    
    return {
      ...cacheStats,
      hitRate: Math.round(hitRate * 100) / 100,
      memorySize: memoryCache.size
    };
  }

  /**
   * Clean up expired cache entries
   */
  static async cleanup(): Promise<void> {
    try {
      const now = Date.now();
      
      // Clean memory cache
      for (const [key, value] of memoryCache.entries()) {
        if (value.expires <= now) {
          memoryCache.delete(key);
        }
      }

      // Clean database cache
      if (sql) {
        const deleted = await sql`
          DELETE FROM database_cache WHERE expires_at < NOW()
        `;
        console.log(`Cleaned up ${deleted.length} expired cache entries`);
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  /**
   * Record cache operation for analytics
   */
  private static async recordCacheOperation(
    key: string,
    cacheType: string,
    operation: string,
    responseTime: number,
    dataSize?: number
  ): Promise<void> {
    try {
      if (sql) {
        await sql`
          INSERT INTO cache_performance (cache_key, cache_type, operation, response_time_ms, data_size_bytes)
          VALUES (${key}, ${cacheType}, ${operation}, ${responseTime}, ${dataSize || null})
        `;
      }
    } catch (error) {
      // Don't log cache recording errors to avoid recursion
    }
  }
}

/**
 * Query performance monitoring
 */
export class QueryOptimizer {
  /**
   * Monitor query performance
   */
  static async monitorQuery<T>(
    queryText: string,
    queryFunction: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    const queryHash = this.hashQuery(queryText);
    
    try {
      const result = await queryFunction();
      const executionTime = Date.now() - startTime;
      
      // Record query performance
      await this.recordQueryPerformance(queryHash, queryText, executionTime, result);
      
      // Check for slow queries
      if (executionTime > 1000) { // Queries taking more than 1 second
        await this.createPerformanceAlert(
          'slow_query',
          'warning',
          `Slow query detected: ${executionTime}ms`,
          1000,
          executionTime
        );
      }
      
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      await this.recordQueryPerformance(queryHash, queryText, executionTime, null, error as Error);
      throw error;
    }
  }

  /**
   * Get query performance analytics
   */
  static async getQueryAnalytics(): Promise<{
    slowestQueries: QueryOptimization[];
    averageQueryTime: number;
    totalQueries: number;
    optimizationOpportunities: string[];
  }> {
    try {
      if (!sql) {
        return {
          slowestQueries: [],
          averageQueryTime: 0,
          totalQueries: 0,
          optimizationOpportunities: []
        };
      }

      const slowQueries = await sql`
        SELECT 
          query_hash,
          query_text,
          AVG(execution_time_ms) as avg_execution_time,
          COUNT(*) as execution_count,
          MAX(execution_time_ms) as max_execution_time,
          AVG(rows_examined) as avg_rows_examined,
          AVG(rows_returned) as avg_rows_returned
        FROM query_performance
        WHERE timestamp > NOW() - INTERVAL '24 hours'
        GROUP BY query_hash, query_text
        ORDER BY avg_execution_time DESC
        LIMIT 10
      ` as Array<{
        query_hash: string;
        query_text: string;
        avg_execution_time: number;
        execution_count: number;
        max_execution_time: number;
        avg_rows_examined: number;
        avg_rows_returned: number;
      }>;

      const overallStats = await sql`
        SELECT 
          AVG(execution_time_ms) as avg_query_time,
          COUNT(*) as total_queries
        FROM query_performance
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      ` as Array<{ avg_query_time: number; total_queries: number }>;

      const stats = overallStats[0] || { avg_query_time: 0, total_queries: 0 };

      const slowestQueries: QueryOptimization[] = slowQueries.map(q => ({
        query: q.query_text,
        executionTime: q.avg_execution_time,
        rowsExamined: q.avg_rows_examined || 0,
        rowsReturned: q.avg_rows_returned || 0,
        indexesUsed: [], // Would need to parse EXPLAIN output
        optimizationSuggestions: this.generateOptimizationSuggestions(q)
      }));

      const optimizationOpportunities = [
        'Add indexes for frequently queried columns',
        'Consider query result caching for repeated queries',
        'Optimize JOIN operations with proper indexing',
        'Use LIMIT clauses for large result sets'
      ];

      return {
        slowestQueries,
        averageQueryTime: Math.round(stats.avg_query_time * 100) / 100,
        totalQueries: stats.total_queries,
        optimizationOpportunities
      };
    } catch (error) {
      console.error('Failed to get query analytics:', error);
      return {
        slowestQueries: [],
        averageQueryTime: 0,
        totalQueries: 0,
        optimizationOpportunities: []
      };
    }
  }

  /**
   * Generate optimization suggestions
   */
  private static generateOptimizationSuggestions(queryData: {
    avg_execution_time: number;
    avg_rows_examined: number;
    avg_rows_returned: number;
    query_text: string;
  }): string[] {
    const suggestions: string[] = [];

    if (queryData.avg_execution_time > 500) {
      suggestions.push('Query execution time is high - consider optimization');
    }

    if (queryData.avg_rows_examined > queryData.avg_rows_returned * 10) {
      suggestions.push('High rows examined to returned ratio - add selective indexes');
    }

    if (queryData.query_text.includes('SELECT *')) {
      suggestions.push('Avoid SELECT * - specify only needed columns');
    }

    if (queryData.query_text.includes('ORDER BY') && !queryData.query_text.includes('LIMIT')) {
      suggestions.push('Consider adding LIMIT to ORDER BY queries');
    }

    return suggestions;
  }

  /**
   * Hash query for tracking
   */
  private static hashQuery(query: string): string {
    // Simple hash function for query identification
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Record query performance
   */
  private static async recordQueryPerformance(
    queryHash: string,
    queryText: string,
    executionTime: number,
    result: unknown,
    _error?: Error
  ): Promise<void> {
    try {
      if (sql) {
        const rowsReturned = Array.isArray(result) ? result.length : (result ? 1 : 0);
        
        await sql`
          INSERT INTO query_performance (
            query_hash, query_text, execution_time_ms, rows_returned
          )
          VALUES (${queryHash}, ${queryText}, ${executionTime}, ${rowsReturned})
        `;
      }
    } catch (recordError) {
      // Don't log recording errors to avoid recursion
    }
  }

  /**
   * Create performance alert
   */
  private static async createPerformanceAlert(
    alertType: string,
    severity: string,
    message: string,
    threshold: number,
    actualValue: number
  ): Promise<void> {
    try {
      if (sql) {
        await sql`
          INSERT INTO performance_alerts (
            alert_type, severity, message, threshold_value, actual_value
          )
          VALUES (${alertType}, ${severity}, ${message}, ${threshold}, ${actualValue})
        `;
      }
    } catch (error) {
      console.error('Failed to create performance alert:', error);
    }
  }
}

/**
 * System health monitoring
 */
export class HealthMonitor {
  private static services = [
    { name: 'database', url: 'internal://database' },
    { name: 'cache', url: 'internal://cache' },
    { name: 'email', url: 'internal://email' },
    { name: 'payment', url: 'internal://payment' }
  ];

  /**
   * Perform comprehensive health check
   */
  static async performHealthCheck(): Promise<SystemHealth> {
    const startTime = Date.now();
    const serviceResults = [];
    const alerts = [];

    // Check each service
    for (const service of this.services) {
      const serviceHealth = await this.checkService(service.name);
      serviceResults.push(serviceHealth);

      if (serviceHealth.status === 'down') {
        alerts.push({
          level: 'critical' as const,
          message: `Service ${service.name} is down`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      } else if (serviceHealth.status === 'degraded') {
        alerts.push({
          level: 'warning' as const,
          message: `Service ${service.name} is degraded`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
    }

    // Check system metrics
    const cacheStats = CacheManager.getCacheStats();
    if (cacheStats.hitRate < 50) {
      alerts.push({
        level: 'warning' as const,
        message: `Low cache hit rate: ${cacheStats.hitRate}%`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Determine overall system status
    const criticalServices = serviceResults.filter(s => s.status === 'down').length;
    const degradedServices = serviceResults.filter(s => s.status === 'degraded').length;
    
    let overallStatus: SystemHealth['status'] = 'healthy';
    if (criticalServices > 0) {
      overallStatus = 'critical';
    } else if (degradedServices > 0) {
      overallStatus = 'warning';
    }

    const healthCheck: SystemHealth = {
      status: overallStatus,
      uptime: Date.now() - startTime, // Simplified uptime
      lastHealthCheck: new Date().toISOString(),
      services: serviceResults,
      alerts
    };

    // Record health check
    await this.recordHealthCheck(healthCheck);

    return healthCheck;
  }

  /**
   * Check individual service health
   */
  private static async checkService(serviceName: string): Promise<SystemHealth['services'][0]> {
    const startTime = Date.now();
    
    try {
      let status: 'up' | 'down' | 'degraded' = 'up';
      
      // Service-specific health checks
      switch (serviceName) {
        case 'database':
          if (sql) {
            await sql`SELECT 1`;
          } else {
            status = 'down';
          }
          break;
          
        case 'cache':
          // Test cache operations
          await CacheManager.set({
            key: 'health_check',
            data: { test: true },
            ttl: 60
          });
          const cached = await CacheManager.get('health_check');
          if (!cached) status = 'degraded';
          break;
          
        case 'email':
          // Would check email service connectivity
          status = 'up'; // Placeholder
          break;
          
        case 'payment':
          // Would check payment processor connectivity
          status = 'up'; // Placeholder
          break;
      }

      const responseTime = Date.now() - startTime;
      
      // Consider slow response as degraded
      if (responseTime > 2000) {
        status = 'degraded';
      }

      return {
        name: serviceName,
        status,
        responseTime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: serviceName,
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Record health check results
   */
  private static async recordHealthCheck(healthCheck: SystemHealth): Promise<void> {
    try {
      if (sql) {
        for (const service of healthCheck.services) {
          await sql`
            INSERT INTO system_health_checks (
              service_name, status, response_time_ms, metadata
            )
            VALUES (
              ${service.name}, 
              ${service.status}, 
              ${service.responseTime},
              ${JSON.stringify({ lastCheck: service.lastCheck })}
            )
          `;
        }
      }
    } catch (error) {
      console.error('Failed to record health check:', error);
    }
  }

  /**
   * Get system performance metrics
   */
  static async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const cacheStats = CacheManager.getCacheStats();
      
      // Get recent performance data
      const recentMetrics = await sql`
        SELECT 
          metric_name,
          AVG(metric_value) as avg_value
        FROM performance_metrics
        WHERE timestamp > NOW() - INTERVAL '1 hour'
        GROUP BY metric_name
      ` as Array<{ metric_name: string; avg_value: number }>;

      const metrics: Record<string, number> = {};
      recentMetrics.forEach(m => {
        metrics[m.metric_name] = m.avg_value;
      });

      return {
        responseTime: metrics.response_time || 0,
        throughput: metrics.throughput || 0,
        errorRate: metrics.error_rate || 0,
        cacheHitRate: cacheStats.hitRate,
        databaseQueryTime: metrics.db_query_time || 0,
        memoryUsage: metrics.memory_usage || 0,
        cpuUsage: metrics.cpu_usage || 0
      };
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return {
        responseTime: 0,
        throughput: 0,
        errorRate: 0,
        cacheHitRate: 0,
        databaseQueryTime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      };
    }
  }
}

/**
 * Performance middleware for tracking request metrics
 */
export function createPerformanceMiddleware() {
  return async (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Track request start
    res.on('finish', async () => {
      const responseTime = Date.now() - startTime;
      
      try {
        if (sql) {
          await sql`
            INSERT INTO performance_metrics (
              metric_name, metric_value, metric_unit, endpoint, user_agent
            )
            VALUES (
              'response_time', 
              ${responseTime}, 
              'ms', 
              ${req.path || req.url}, 
              ${req.get('User-Agent') || ''}
            )
          `;
        }
      } catch (error) {
        // Don't fail request due to metrics recording error
      }
    });
    
    next();
  };
}

/**
 * Automated performance optimization
 */
export async function runPerformanceOptimization(): Promise<void> {
  try {
    console.log('🚀 Running performance optimization...');

    // Clean up expired cache entries
    await CacheManager.cleanup();
    console.log('✅ Cache cleanup completed');

    // Analyze slow queries and suggest optimizations
    const queryAnalytics = await QueryOptimizer.getQueryAnalytics();
    if (queryAnalytics.slowestQueries.length > 0) {
      console.log(`⚠️ Found ${queryAnalytics.slowestQueries.length} slow queries`);
      queryAnalytics.slowestQueries.forEach(query => {
        console.log(`- Query taking ${query.executionTime}ms: ${query.optimizationSuggestions.join(', ')}`);
      });
    }

    // Perform health check
    const healthCheck = await HealthMonitor.performHealthCheck();
    console.log(`✅ System health: ${healthCheck.status}`);
    
    if (healthCheck.alerts.length > 0) {
      console.log(`⚠️ ${healthCheck.alerts.length} alerts found`);
      healthCheck.alerts.forEach(alert => {
        console.log(`- ${alert.level.toUpperCase()}: ${alert.message}`);
      });
    }

    // Clean up old performance data (keep last 30 days)
    if (sql) {
      await sql`DELETE FROM performance_metrics WHERE timestamp < NOW() - INTERVAL '30 days'`;
      await sql`DELETE FROM query_performance WHERE timestamp < NOW() - INTERVAL '30 days'`;
      await sql`DELETE FROM cache_performance WHERE timestamp < NOW() - INTERVAL '30 days'`;
      console.log('✅ Old performance data cleaned up');
    }

    console.log('✅ Performance optimization completed');
  } catch (error) {
    console.error('❌ Performance optimization failed:', error);
  }
}

// Initialize performance optimization tables on module load
initializePerformanceOptimizationTables();

// Run performance optimization every hour
setInterval(runPerformanceOptimization, 60 * 60 * 1000);

// Clean up memory cache every 15 minutes
setInterval(() => CacheManager.cleanup(), 15 * 60 * 1000);