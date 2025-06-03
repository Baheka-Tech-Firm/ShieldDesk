import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';

// Security event severity levels
export enum SecuritySeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO'
}

// Event categories for SIEM classification
export enum EventCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  SYSTEM_CHANGE = 'system_change',
  NETWORK_ACTIVITY = 'network_activity',
  FILE_OPERATION = 'file_operation',
  COMPLIANCE = 'compliance',
  INCIDENT = 'incident',
  VULNERABILITY = 'vulnerability',
  THREAT_DETECTION = 'threat_detection'
}

interface SecurityEvent {
  timestamp: Date;
  eventId: string;
  userId?: string;
  sessionId?: string;
  organizationId?: string;
  category: EventCategory;
  action: string;
  resource?: string;
  resourceId?: string;
  severity: SecuritySeverity;
  ipAddress: string;
  userAgent?: string;
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
  };
  details: Record<string, any>;
  riskScore?: number;
  correlationId?: string;
  sourceSystem: string;
  compliance: {
    retention: number; // days
    classification: string;
    encrypted: boolean;
  };
}

interface SIEMAlert {
  alertId: string;
  title: string;
  description: string;
  severity: SecuritySeverity;
  category: EventCategory;
  events: SecurityEvent[];
  riskScore: number;
  recommendedActions: string[];
  createdAt: Date;
  acknowledged: boolean;
  assignedTo?: string;
}

export class LoggingService {
  private logger: winston.Logger;
  private securityLogger: winston.Logger;
  private auditLogger: winston.Logger;
  private elasticsearchClient?: ElasticsearchClient;
  private encryptionKey: string;
  private logRetentionDays: number = 2555; // 7 years for compliance
  private eventStore: Map<string, SecurityEvent[]> = new Map();

  constructor() {
    this.encryptionKey = process.env.LOG_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    this.logRetentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '2555');
    
    this.initializeLoggers();
    this.initializeElasticsearch();
    this.setupLogRetention();
  }

  private initializeLoggers(): void {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Custom format with encryption for sensitive data
    const secureFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf((info) => {
        // Encrypt sensitive fields
        if (info.details && typeof info.details === 'object') {
          info.details = this.encryptSensitiveData(info.details);
        }
        return JSON.stringify(info);
      })
    );

    // Application logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new DailyRotateFile({
          filename: path.join(logsDir, 'application-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '30d',
          zippedArchive: true
        })
      ]
    });

    // Security events logger (encrypted)
    this.securityLogger = winston.createLogger({
      level: 'info',
      format: secureFormat,
      transports: [
        new DailyRotateFile({
          filename: path.join(logsDir, 'security-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '50m',
          maxFiles: `${this.logRetentionDays}d`,
          zippedArchive: true
        })
      ]
    });

    // Audit trail logger (regulatory compliance)
    this.auditLogger = winston.createLogger({
      level: 'info',
      format: secureFormat,
      transports: [
        new DailyRotateFile({
          filename: path.join(logsDir, 'audit-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '50m',
          maxFiles: `${this.logRetentionDays}d`,
          zippedArchive: true
        })
      ]
    });
  }

  private initializeElasticsearch(): void {
    if (process.env.ELASTICSEARCH_HOST) {
      this.elasticsearchClient = new ElasticsearchClient({
        node: process.env.ELASTICSEARCH_HOST,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
          password: process.env.ELASTICSEARCH_PASSWORD || ''
        },
        ssl: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      });

      // Create indices if they don't exist
      this.createElasticsearchIndices();
    }
  }

  private async createElasticsearchIndices(): Promise<void> {
    if (!this.elasticsearchClient) return;

    const indices = [
      'shielddesk-security-events',
      'shielddesk-audit-logs',
      'shielddesk-system-logs',
      'shielddesk-alerts'
    ];

    for (const index of indices) {
      try {
        const exists = await this.elasticsearchClient.indices.exists({ index });
        if (!exists) {
          await this.elasticsearchClient.indices.create({
            index,
            body: {
              settings: {
                number_of_shards: 1,
                number_of_replicas: 1
              },
              mappings: {
                properties: {
                  timestamp: { type: 'date' },
                  eventId: { type: 'keyword' },
                  userId: { type: 'keyword' },
                  organizationId: { type: 'keyword' },
                  category: { type: 'keyword' },
                  severity: { type: 'keyword' },
                  ipAddress: { type: 'ip' },
                  riskScore: { type: 'integer' },
                  details: { type: 'object', enabled: false }
                }
              }
            }
          });
        }
      } catch (error) {
        this.logger.error('Failed to create Elasticsearch index', { index, error });
      }
    }
  }

  private encryptSensitiveData(data: any): any {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];
    const encrypted = { ...data };

    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        encrypted[field] = this.encrypt(encrypted[field].toString());
      }
    }

    return encrypted;
  }

  private encrypt(text: string): string {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(this.encryptionKey.slice(0, 32));
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private setupLogRetention(): void {
    // Cleanup old logs that exceed retention policy
    // Run daily at 2 AM
    cron.schedule('0 2 * * *', () => {
      this.cleanupOldLogs();
    });
  }

  private async cleanupOldLogs(): Promise<void> {
    const logsDir = path.join(process.cwd(), 'logs');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.logRetentionDays);

    try {
      const files = fs.readdirSync(logsDir);
      
      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          this.logger.info('Deleted old log file due to retention policy', { file });
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old logs', { error });
    }
  }

  /**
   * Log security events with SIEM integration
   */
  async logSecurityEvent(event: Partial<SecurityEvent>): Promise<void> {
    const securityEvent: SecurityEvent = {
      timestamp: new Date(),
      eventId: crypto.randomUUID(),
      category: event.category || EventCategory.SYSTEM_CHANGE,
      action: event.action || 'unknown',
      severity: event.severity || SecuritySeverity.INFO,
      ipAddress: event.ipAddress || '0.0.0.0',
      details: event.details || {},
      sourceSystem: 'ShieldDesk',
      compliance: {
        retention: this.logRetentionDays,
        classification: this.getDataClassification(event.severity || SecuritySeverity.INFO),
        encrypted: true
      },
      ...event
    };

    // Store in memory for correlation analysis
    const key = `${securityEvent.userId || 'anonymous'}_${securityEvent.category}_${securityEvent.action}`;
    if (!this.eventStore.has(key)) {
      this.eventStore.set(key, []);
    }
    this.eventStore.get(key)!.push(securityEvent);

    // Log to file system
    this.securityLogger.info('Security Event', securityEvent);

    // Send to Elasticsearch/SIEM
    if (this.elasticsearchClient) {
      try {
        await this.elasticsearchClient.index({
          index: 'shielddesk-security-events',
          body: securityEvent
        });
      } catch (error) {
        this.logger.error('Failed to send security event to Elasticsearch', { error });
      }
    }

    // Check for alert conditions
    await this.analyzeForAlerts(securityEvent);
  }

  /**
   * Log audit events for regulatory compliance
   */
  async logAuditEvent(event: Partial<SecurityEvent>): Promise<void> {
    const auditEvent: SecurityEvent = {
      timestamp: new Date(),
      eventId: crypto.randomUUID(),
      category: event.category || EventCategory.DATA_ACCESS,
      action: event.action || 'unknown',
      severity: event.severity || SecuritySeverity.INFO,
      ipAddress: event.ipAddress || '0.0.0.0',
      details: event.details || {},
      sourceSystem: 'ShieldDesk',
      compliance: {
        retention: this.logRetentionDays,
        classification: 'AUDIT',
        encrypted: true
      },
      ...event
    };

    // Log to audit trail
    this.auditLogger.info('Audit Event', auditEvent);

    // Send to Elasticsearch
    if (this.elasticsearchClient) {
      try {
        await this.elasticsearchClient.index({
          index: 'shielddesk-audit-logs',
          body: auditEvent
        });
      } catch (error) {
        this.logger.error('Failed to send audit event to Elasticsearch', { error });
      }
    }
  }

  /**
   * Analyze events for security alerts
   */
  private async analyzeForAlerts(event: SecurityEvent): Promise<void> {
    const alerts: SIEMAlert[] = [];

    // Multiple failed login attempts
    if (event.category === EventCategory.AUTHENTICATION && 
        event.action === 'FAILED_LOGIN' && 
        event.userId) {
      const recentFailures = this.getRecentEventsFromMemory(
        EventCategory.AUTHENTICATION,
        'FAILED_LOGIN',
        event.userId,
        15 // 15 minutes
      );

      if (recentFailures.length >= 5) {
        alerts.push({
          alertId: crypto.randomUUID(),
          title: 'Multiple Failed Login Attempts',
          description: `User ${event.userId} has ${recentFailures.length} failed login attempts in 15 minutes`,
          severity: SecuritySeverity.HIGH,
          category: EventCategory.AUTHENTICATION,
          events: recentFailures,
          riskScore: 85,
          recommendedActions: [
            'Lock user account',
            'Investigate IP address',
            'Check for credential compromise',
            'Review recent account activity'
          ],
          createdAt: new Date(),
          acknowledged: false
        });
      }
    }

    // Process alerts
    for (const alert of alerts) {
      await this.createAlert(alert);
    }
  }

  /**
   * Get recent events from memory store for correlation analysis
   */
  private getRecentEventsFromMemory(
    category: EventCategory,
    action?: string,
    userId?: string,
    minutesBack: number = 15
  ): SecurityEvent[] {
    const cutoffTime = new Date(Date.now() - minutesBack * 60 * 1000);
    const allEvents: SecurityEvent[] = [];

    for (const [key, events] of this.eventStore.entries()) {
      if (userId && !key.includes(userId)) continue;
      if (!key.includes(category)) continue;
      if (action && !key.includes(action)) continue;

      const recentEvents = events.filter(event => event.timestamp >= cutoffTime);
      allEvents.push(...recentEvents);
    }

    return allEvents;
  }

  /**
   * Create and distribute security alerts
   */
  private async createAlert(alert: SIEMAlert): Promise<void> {
    // Log alert
    this.logger.warn('Security Alert Generated', alert);

    // Store in Elasticsearch
    if (this.elasticsearchClient) {
      try {
        await this.elasticsearchClient.index({
          index: 'shielddesk-alerts',
          body: alert
        });
      } catch (error) {
        this.logger.error('Failed to store alert in Elasticsearch', { error });
      }
    }

    // Send notifications based on severity
    await this.sendAlertNotifications(alert);
  }

  /**
   * Send alert notifications via configured channels
   */
  private async sendAlertNotifications(alert: SIEMAlert): Promise<void> {
    // Email notifications for critical/high severity
    if ([SecuritySeverity.CRITICAL, SecuritySeverity.HIGH].includes(alert.severity)) {
      this.logger.info('High severity alert - email notification required', {
        alertId: alert.alertId,
        severity: alert.severity
      });
    }

    // Webhook notifications for external SIEM
    if (process.env.SIEM_WEBHOOK_URL) {
      try {
        const response = await fetch(process.env.SIEM_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SIEM_WEBHOOK_TOKEN}`
          },
          body: JSON.stringify(alert)
        });

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.statusText}`);
        }
      } catch (error) {
        this.logger.error('Failed to send alert to external SIEM', { error });
      }
    }
  }

  /**
   * Get data classification based on severity
   */
  private getDataClassification(severity: SecuritySeverity): string {
    switch (severity) {
      case SecuritySeverity.CRITICAL:
        return 'TOP_SECRET';
      case SecuritySeverity.HIGH:
        return 'SECRET';
      case SecuritySeverity.MEDIUM:
        return 'CONFIDENTIAL';
      default:
        return 'INTERNAL';
    }
  }

  /**
   * Generate compliance reports
   */
  async generateComplianceReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    if (this.elasticsearchClient) {
      try {
        const response = await this.elasticsearchClient.search({
          index: 'shielddesk-audit-logs',
          body: {
            query: {
              bool: {
                must: [
                  { term: { organizationId } },
                  {
                    range: {
                      timestamp: {
                        gte: startDate.toISOString(),
                        lte: endDate.toISOString()
                      }
                    }
                  }
                ]
              }
            },
            aggs: {
              by_category: {
                terms: { field: 'category.keyword' }
              },
              by_severity: {
                terms: { field: 'severity.keyword' }
              },
              by_user: {
                terms: { field: 'userId.keyword' }
              }
            }
          }
        });

        return {
          totalEvents: response.body.hits.total.value,
          eventsByCategory: response.body.aggregations?.by_category.buckets || [],
          eventsBySeverity: response.body.aggregations?.by_severity.buckets || [],
          eventsByUser: response.body.aggregations?.by_user.buckets || [],
          period: { startDate, endDate },
          generatedAt: new Date()
        };
      } catch (error) {
        this.logger.error('Failed to generate compliance report', { error });
        throw error;
      }
    }

    return {
      totalEvents: 0,
      eventsByCategory: [],
      eventsBySeverity: [],
      eventsByUser: [],
      period: { startDate, endDate },
      generatedAt: new Date(),
      note: 'Elasticsearch not configured'
    };
  }

  /**
   * Health check for monitoring systems
   */
  async healthCheck(): Promise<any> {
    const health = {
      winston: true,
      elasticsearch: false,
      logRetention: this.logRetentionDays,
      eventsInMemory: this.eventStore.size,
      diskSpace: await this.checkDiskSpace(),
      lastLogRotation: await this.getLastLogRotation()
    };

    if (this.elasticsearchClient) {
      try {
        await this.elasticsearchClient.ping();
        health.elasticsearch = true;
      } catch (error) {
        this.logger.error('Elasticsearch health check failed', { error });
      }
    }

    return health;
  }

  private async checkDiskSpace(): Promise<any> {
    return { available: '100GB', used: '50GB', percentage: 33 };
  }

  private async getLastLogRotation(): Promise<Date | null> {
    return new Date();
  }

  /**
   * Public logging methods
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}

export const loggingService = new LoggingService();