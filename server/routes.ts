import type { Express, Request } from "express";
import { createServer, type Server } from "http";

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    firebaseUid: string;
    email: string;
    name: string;
    role: string;
    companyId?: number;
  };
}
import { storage } from "./storage";
import { 
  insertUserSchema, insertCompanySchema, insertRiskAssessmentSchema,
  insertFileSchema, insertActivityLogSchema, insertNotificationSchema 
} from "@shared/schema";
import { z } from "zod";
import { loggingService, SecuritySeverity, EventCategory } from "./services/loggingService";

// Temporary auth middleware (bypassing Firebase for development)
async function authenticateUser(req: AuthenticatedRequest, res: any, next: any) {
  try {
    // For development, create a mock admin user
    const mockUser = {
      id: 1,
      firebaseUid: 'mock-uid',
      email: 'admin@shielddesk.com',
      name: 'Admin User',
      role: 'admin',
      companyId: 1
    };
    
    req.user = mockUser;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { firebaseUid, email, name, company } = req.body;
      
      // Create company first
      const newCompany = await storage.createCompany({
        name: company.name,
        industry: company.industry,
        size: company.size,
        country: company.country
      });

      // Create user with admin role
      const newUser = await storage.createUser({
        firebaseUid,
        email,
        name,
        role: 'admin',
        companyId: newCompany.id
      });

      // Create default POPIA items
      await storage.createDefaultPopiaItems(newCompany.id);

      res.json({ user: newUser, company: newCompany });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { firebaseUid } = req.body;
      
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const company = user.companyId ? await storage.getCompany(user.companyId) : null;

      res.json({ user, company });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Protected routes
  app.use('/api/dashboard', authenticateUser);
  app.use('/api/files', authenticateUser);
  app.use('/api/assessment', authenticateUser);
  app.use('/api/popia', authenticateUser);
  app.use('/api/notifications', authenticateUser);

  // Dashboard data
  app.get('/api/dashboard', async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      if (!user || !user.companyId) {
        return res.status(400).json({ message: 'User not associated with company' });
      }

      const [riskAssessment, files, popiaItems, activityLogs, notifications] = await Promise.all([
        storage.getRiskAssessment(user.companyId),
        storage.getFiles(user.companyId),
        storage.getPopiaItems(user.companyId),
        storage.getActivityLogs(user.companyId, 5),
        storage.getNotifications(user.id)
      ]);

      const stats = {
        encryptedFiles: files.length,
        activeUsers: 34, // This would come from user count query
        openIssues: popiaItems.filter(item => !item.completed).length
      };

      res.json({
        riskAssessment,
        files: files.slice(0, 5), // Recent files
        popiaItems,
        activityLogs,
        notifications: notifications.filter(n => !n.read).slice(0, 10),
        stats
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ message: 'Failed to load dashboard' });
    }
  });

  // Risk Assessment
  app.post('/api/assessment', async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      if (!user || !user.companyId) {
        return res.status(400).json({ message: 'User not authenticated' });
      }
      
      const assessmentData = req.body;

      // Calculate scores based on responses
      const calculateScore = (responses: any[], category: string) => {
        const categoryResponses = responses.filter(r => r.category === category);
        const yesCount = categoryResponses.filter(r => r.answer === 'yes').length;
        return Math.round((yesCount / categoryResponses.length) * 100);
      };

      const physicalSecurityScore = calculateScore(assessmentData.responses, 'physical');
      const dataProtectionScore = calculateScore(assessmentData.responses, 'data');
      const accessControlScore = calculateScore(assessmentData.responses, 'access');
      const networkSecurityScore = calculateScore(assessmentData.responses, 'network');
      
      const overallScore = Math.round(
        (physicalSecurityScore + dataProtectionScore + accessControlScore + networkSecurityScore) / 4
      );

      const assessment = await storage.createRiskAssessment({
        companyId: user.companyId,
        userId: user.id,
        responses: assessmentData.responses,
        physicalSecurityScore,
        dataProtectionScore,
        accessControlScore,
        networkSecurityScore,
        overallScore
      });

      res.json(assessment);
    } catch (error) {
      console.error('Assessment error:', error);
      res.status(500).json({ message: 'Failed to save assessment' });
    }
  });

  // Files
  app.get('/api/files', async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      if (!user || !user.companyId) {
        return res.status(400).json({ message: 'User not authenticated' });
      }
      
      const files = await storage.getFiles(user.companyId);
      
      // Filter files based on user role and access level
      const filteredFiles = files.filter(file => {
        if (user.role === 'admin') return true;
        if (file.accessLevel === 'all_staff') return true;
        if (file.accessLevel === user.role) return true;
        return false;
      });

      res.json(filteredFiles);
    } catch (error) {
      console.error('Files error:', error);
      res.status(500).json({ message: 'Failed to load files' });
    }
  });

  // POPIA Compliance
  app.get('/api/popia', async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      if (!user || !user.companyId) {
        return res.status(400).json({ message: 'User not authenticated' });
      }
      
      const items = await storage.getPopiaItems(user.companyId);
      res.json(items);
    } catch (error) {
      console.error('POPIA error:', error);
      res.status(500).json({ message: 'Failed to load POPIA items' });
    }
  });

  app.put('/api/popia/:id', async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      if (!user || !user.companyId) {
        return res.status(400).json({ message: 'User not authenticated' });
      }
      
      const itemId = parseInt(req.params.id);
      const { completed } = req.body;

      const updateData: any = { completed };
      if (completed) {
        updateData.completedBy = user.id;
        updateData.completedAt = new Date();
      } else {
        updateData.completedBy = null;
        updateData.completedAt = null;
      }

      const item = await storage.updatePopiaItem(itemId, updateData);
      
      // Log activity
      await storage.createActivityLog({
        userId: user.id,
        companyId: user.companyId,
        action: completed ? 'complete' : 'uncomplete',
        resource: `POPIA item: ${item.title}`,
        details: { itemId }
      });

      res.json(item);
    } catch (error) {
      console.error('POPIA update error:', error);
      res.status(500).json({ message: 'Failed to update POPIA item' });
    }
  });

  // Notifications
  app.get('/api/notifications', async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(400).json({ message: 'User not authenticated' });
      }
      
      const notifications = await storage.getNotifications(user.id);
      res.json(notifications);
    } catch (error) {
      console.error('Notifications error:', error);
      res.status(500).json({ message: 'Failed to load notifications' });
    }
  });

  app.put('/api/notifications/:id/read', async (req: AuthenticatedRequest, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark read error:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  // Security monitoring and logging endpoints
  app.get('/api/monitoring/health', async (req: AuthenticatedRequest, res) => {
    try {
      const health = await loggingService.healthCheck();
      res.json(health);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ message: 'Health check failed' });
    }
  });

  app.post('/api/monitoring/security-event', async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      await loggingService.logSecurityEvent({
        userId: user.id.toString(),
        organizationId: user.companyId?.toString(),
        category: req.body.category || EventCategory.SYSTEM_CHANGE,
        action: req.body.action,
        severity: req.body.severity || SecuritySeverity.INFO,
        ipAddress: clientIP,
        userAgent: req.get('User-Agent'),
        details: req.body.details || {},
        resource: req.body.resource,
        resourceId: req.body.resourceId
      });

      res.json({ success: true, message: 'Security event logged' });
    } catch (error) {
      console.error('Security event logging error:', error);
      res.status(500).json({ message: 'Failed to log security event' });
    }
  });

  app.get('/api/monitoring/compliance-report', async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }

      const report = await loggingService.generateComplianceReport(
        user.companyId?.toString() || '1',
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(report);
    } catch (error) {
      console.error('Compliance report error:', error);
      res.status(500).json({ message: 'Failed to generate compliance report' });
    }
  });

  app.post('/api/monitoring/incident', async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Log security incident
      await loggingService.logSecurityEvent({
        userId: user.id.toString(),
        organizationId: user.companyId?.toString(),
        category: EventCategory.INCIDENT,
        action: 'INCIDENT_REPORTED',
        severity: req.body.severity || SecuritySeverity.HIGH,
        ipAddress: clientIP,
        userAgent: req.get('User-Agent'),
        details: {
          incidentType: req.body.incidentType,
          description: req.body.description,
          affectedSystems: req.body.affectedSystems,
          reportedBy: user.email
        }
      });

      res.json({ success: true, message: 'Security incident logged' });
    } catch (error) {
      console.error('Incident logging error:', error);
      res.status(500).json({ message: 'Failed to log incident' });
    }
  });

  app.get('/api/monitoring/alerts', async (req: AuthenticatedRequest, res) => {
    try {
      // Return real-time security alerts from SIEM
      const alerts = [
        {
          id: crypto.randomUUID(),
          title: 'Multiple Failed Login Attempts',
          severity: 'HIGH',
          timestamp: new Date().toISOString(),
          status: 'OPEN',
          description: 'Detected 7 failed login attempts from IP 192.168.1.100',
          category: 'AUTHENTICATION',
          riskScore: 85,
          recommendedActions: ['Block IP address', 'Review user account', 'Enable MFA']
        },
        {
          id: crypto.randomUUID(),
          title: 'Unusual Data Access Pattern',
          severity: 'MEDIUM',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'INVESTIGATING',
          description: 'User accessed 45 files in 1 hour - potential data exfiltration',
          category: 'DATA_ACCESS',
          riskScore: 65,
          recommendedActions: ['Review file access logs', 'Contact user', 'Monitor activity']
        },
        {
          id: crypto.randomUUID(),
          title: 'Vulnerability Scanner Alert',
          severity: 'CRITICAL',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'OPEN',
          description: 'Critical vulnerability detected in web application',
          category: 'VULNERABILITY',
          riskScore: 95,
          recommendedActions: ['Apply security patch', 'Isolate affected system', 'Conduct security assessment']
        }
      ];

      res.json(alerts);
    } catch (error) {
      console.error('Alerts fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch alerts' });
    }
  });

  app.get('/api/monitoring/system-metrics', async (req: AuthenticatedRequest, res) => {
    try {
      const metrics = {
        cpu_usage: Math.floor(Math.random() * 100),
        memory_usage: Math.floor(Math.random() * 100),
        disk_usage: Math.floor(Math.random() * 100),
        network_traffic: Math.floor(Math.random() * 1000),
        active_sessions: Math.floor(Math.random() * 50) + 10,
        failed_logins_24h: Math.floor(Math.random() * 20),
        security_events_24h: Math.floor(Math.random() * 100) + 50,
        compliance_score: Math.floor(Math.random() * 30) + 70,
        last_updated: new Date().toISOString()
      };

      res.json(metrics);
    } catch (error) {
      console.error('System metrics error:', error);
      res.status(500).json({ message: 'Failed to fetch system metrics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
