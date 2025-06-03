import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertCompanySchema, insertRiskAssessmentSchema,
  insertFileSchema, insertActivityLogSchema, insertNotificationSchema 
} from "@shared/schema";
import { z } from "zod";

// Firebase Admin SDK for token verification
import admin from 'firebase-admin';

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Auth middleware
async function authenticateUser(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    const user = await storage.getUserByFirebaseUid(decodedToken.uid);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
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
  app.get('/api/dashboard', async (req, res) => {
    try {
      const user = req.user;
      if (!user.companyId) {
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
  app.post('/api/assessment', async (req, res) => {
    try {
      const user = req.user;
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
        companyId: user.companyId!,
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
  app.get('/api/files', async (req, res) => {
    try {
      const user = req.user;
      const files = await storage.getFiles(user.companyId!);
      
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
  app.get('/api/popia', async (req, res) => {
    try {
      const user = req.user;
      const items = await storage.getPopiaItems(user.companyId!);
      res.json(items);
    } catch (error) {
      console.error('POPIA error:', error);
      res.status(500).json({ message: 'Failed to load POPIA items' });
    }
  });

  app.put('/api/popia/:id', async (req, res) => {
    try {
      const user = req.user;
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
        companyId: user.companyId!,
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
  app.get('/api/notifications', async (req, res) => {
    try {
      const user = req.user;
      const notifications = await storage.getNotifications(user.id);
      res.json(notifications);
    } catch (error) {
      console.error('Notifications error:', error);
      res.status(500).json({ message: 'Failed to load notifications' });
    }
  });

  app.put('/api/notifications/:id/read', async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark read error:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
