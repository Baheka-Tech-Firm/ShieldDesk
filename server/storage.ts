import { 
  users, companies, riskAssessments, files, popiaItems, activityLogs, notifications,
  type User, type InsertUser, type Company, type InsertCompany, 
  type RiskAssessment, type InsertRiskAssessment, type File, type InsertFile,
  type PopiaItem, type InsertPopiaItem, type ActivityLog, type InsertActivityLog,
  type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // Companies
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;

  // Risk Assessments
  getRiskAssessment(companyId: number): Promise<RiskAssessment | undefined>;
  createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  
  // Files
  getFiles(companyId: number): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: number): Promise<void>;

  // POPIA Items
  getPopiaItems(companyId: number): Promise<PopiaItem[]>;
  updatePopiaItem(id: number, item: Partial<InsertPopiaItem>): Promise<PopiaItem>;
  createDefaultPopiaItems(companyId: number): Promise<void>;

  // Activity Logs
  getActivityLogs(companyId: number, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Notifications
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  // Companies
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: number, updateData: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db.update(companies).set(updateData).where(eq(companies.id, id)).returning();
    return company;
  }

  // Risk Assessments
  async getRiskAssessment(companyId: number): Promise<RiskAssessment | undefined> {
    const [assessment] = await db.select()
      .from(riskAssessments)
      .where(eq(riskAssessments.companyId, companyId))
      .orderBy(desc(riskAssessments.createdAt))
      .limit(1);
    return assessment || undefined;
  }

  async createRiskAssessment(insertAssessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const [assessment] = await db.insert(riskAssessments).values(insertAssessment).returning();
    return assessment;
  }

  // Files
  async getFiles(companyId: number): Promise<File[]> {
    return await db.select()
      .from(files)
      .where(eq(files.companyId, companyId))
      .orderBy(desc(files.createdAt));
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db.insert(files).values(insertFile).returning();
    return file;
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  // POPIA Items
  async getPopiaItems(companyId: number): Promise<PopiaItem[]> {
    return await db.select()
      .from(popiaItems)
      .where(eq(popiaItems.companyId, companyId))
      .orderBy(popiaItems.id);
  }

  async updatePopiaItem(id: number, updateData: Partial<InsertPopiaItem>): Promise<PopiaItem> {
    const [item] = await db.update(popiaItems).set(updateData).where(eq(popiaItems.id, id)).returning();
    return item;
  }

  async createDefaultPopiaItems(companyId: number): Promise<void> {
    const defaultItems = [
      { title: "Data Protection Policy documented", description: "Document and implement comprehensive data protection policies" },
      { title: "Staff training completed", description: "Conduct POPIA awareness training for all staff members" },
      { title: "Data breach response plan", description: "Establish and test data breach response procedures" },
      { title: "Regular security audits scheduled", description: "Schedule and conduct regular security assessments" },
      { title: "Access controls implemented", description: "Implement role-based access controls for data" },
      { title: "Data processing records maintained", description: "Maintain detailed records of all data processing activities" },
      { title: "Third-party agreements reviewed", description: "Review and update all third-party data sharing agreements" },
      { title: "Data retention policies established", description: "Define and implement data retention and deletion policies" },
      { title: "Privacy notices updated", description: "Update and publish clear privacy notices for data subjects" },
      { title: "Data subject rights procedures", description: "Establish procedures for handling data subject requests" },
      { title: "Cross-border transfer safeguards", description: "Implement appropriate safeguards for international data transfers" },
      { title: "Regular compliance monitoring", description: "Establish ongoing compliance monitoring and reporting" },
      { title: "Incident management procedures", description: "Implement comprehensive incident management procedures" },
      { title: "Data minimization practices", description: "Implement data minimization principles in all processes" },
      { title: "Consent management system", description: "Implement systems to manage and track consent" },
      { title: "Regular policy reviews", description: "Schedule regular reviews and updates of all policies" }
    ];

    for (const item of defaultItems) {
      await db.insert(popiaItems).values({
        companyId,
        title: item.title,
        description: item.description,
        completed: false
      });
    }
  }

  // Activity Logs
  async getActivityLogs(companyId: number, limit: number = 50): Promise<ActivityLog[]> {
    return await db.select()
      .from(activityLogs)
      .where(eq(activityLogs.companyId, companyId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db.insert(activityLogs).values(insertLog).returning();
    return log;
  }

  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
