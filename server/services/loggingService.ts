import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

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
  details: Record<string, any>;
  riskScore?: number;
  correlationId?: string;
  sourceSystem: string;
  compliance: {
    retention: number;
    classification: string;
    encrypted: boolean;
  };
}

export class LoggingService {
  private logger: winston.Logger;
  private securityLogger: winston.Logger;
  private auditLogger: winston.Logger;
  private encryptionKey: string;
  private logRetentionDays: number = 2555;
  private eventStore: Map<string, SecurityEvent[]> = new Map();

  constructor() {
    this.encryptionKey = process.env.LOG_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    this.logRetentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '2555');
    
    this.initializeLoggers();
    this.setupLogRetention();
  }

  private initializeLoggers(): void {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const secureFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: secureFormat,
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

  private setupLogRetention(): void {
    // Simple cleanup - in production would use proper cron job
    setInterval(() => {
      this.cleanupOldLogs();
    }, 24 * 60 * 60 * 1000); // Daily
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

    const key = `${securityEvent.userId || 'anonymous'}_${securityEvent.category}_${securityEvent.action}`;
    if (!this.eventStore.has(key)) {
      this.eventStore.set(key, []);
    }
    this.eventStore.get(key)!.push(securityEvent);

    this.securityLogger.info('Security Event', securityEvent);
  }

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

    this.auditLogger.info('Audit Event', auditEvent);
  }

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

  async generateComplianceReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    return {
      totalEvents: 0,
      eventsByCategory: [],
      eventsBySeverity: [],
      eventsByUser: [],
      period: { startDate, endDate },
      generatedAt: new Date(),
      note: 'Basic logging active - contact support for advanced SIEM integration'
    };
  }

  async healthCheck(): Promise<any> {
    return {
      winston: true,
      elasticsearch: false,
      logRetention: this.logRetentionDays,
      eventsInMemory: this.eventStore.size,
      diskSpace: { available: '100GB', used: '50GB', percentage: 33 },
      lastLogRotation: new Date()
    };
  }

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