import { 
  users, companies, riskAssessments, files, folders, filePermissions, folderPermissions,
  fileAccessLogs, fileShares, fileComments, vaultSettings, popiaItems, activityLogs, notifications,
  type User, type InsertUser, type Company, type InsertCompany, 
  type RiskAssessment, type InsertRiskAssessment, type File, type InsertFile,
  type Folder, type InsertFolder, type FilePermission, type InsertFilePermission,
  type FolderPermission, type InsertFolderPermission, type FileAccessLog, type InsertFileAccessLog,
  type FileShare, type InsertFileShare, type FileComment, type InsertFileComment,
  type VaultSettings, type InsertVaultSettings, type PopiaItem, type InsertPopiaItem, 
  type ActivityLog, type InsertActivityLog, type Notification, type InsertNotification
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
  getFiles(companyId: number, folderId?: number): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: Partial<InsertFile>): Promise<File>;
  deleteFile(id: number): Promise<void>;
  getFileVersions(parentFileId: number): Promise<File[]>;
  
  // Folders
  getFolders(companyId: number, parentId?: number): Promise<Folder[]>;
  getFolder(id: number): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, folder: Partial<InsertFolder>): Promise<Folder>;
  deleteFolder(id: number): Promise<void>;
  
  // File Permissions
  getFilePermissions(fileId: number): Promise<FilePermission[]>;
  createFilePermission(permission: InsertFilePermission): Promise<FilePermission>;
  updateFilePermission(id: number, permission: Partial<InsertFilePermission>): Promise<FilePermission>;
  deleteFilePermission(id: number): Promise<void>;
  
  // Folder Permissions
  getFolderPermissions(folderId: number): Promise<FolderPermission[]>;
  createFolderPermission(permission: InsertFolderPermission): Promise<FolderPermission>;
  updateFolderPermission(id: number, permission: Partial<InsertFolderPermission>): Promise<FolderPermission>;
  deleteFolderPermission(id: number): Promise<void>;
  
  // File Access Logs
  getFileAccessLogs(fileId: number, limit?: number): Promise<FileAccessLog[]>;
  createFileAccessLog(log: InsertFileAccessLog): Promise<FileAccessLog>;
  
  // File Shares
  getFileShare(shareId: string): Promise<FileShare | undefined>;
  getFileShares(fileId: number): Promise<FileShare[]>;
  createFileShare(share: InsertFileShare): Promise<FileShare>;
  updateFileShare(id: number, share: Partial<InsertFileShare>): Promise<FileShare>;
  deleteFileShare(id: number): Promise<void>;
  
  // File Comments
  getFileComments(fileId: number): Promise<FileComment[]>;
  createFileComment(comment: InsertFileComment): Promise<FileComment>;
  updateFileComment(id: number, comment: Partial<InsertFileComment>): Promise<FileComment>;
  deleteFileComment(id: number): Promise<void>;
  
  // Vault Settings
  getVaultSettings(companyId: number): Promise<VaultSettings | undefined>;
  createVaultSettings(settings: InsertVaultSettings): Promise<VaultSettings>;
  updateVaultSettings(companyId: number, settings: Partial<InsertVaultSettings>): Promise<VaultSettings>;

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
      .where(eq(files.companyId, companyId));
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db.insert(files).values(insertFile).returning();
    return file;
  }

  async updateFile(id: number, updateData: Partial<InsertFile>): Promise<File> {
    const [file] = await db.update(files).set(updateData).where(eq(files.id, id)).returning();
    return file;
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  async getFileVersions(parentFileId: number): Promise<File[]> {
    return await db.select()
      .from(files)
      .where(eq(files.parentFileId, parentFileId))
      .orderBy(desc(files.version));
  }

  // Folders
  async getFolders(companyId: number, parentId?: number): Promise<Folder[]> {
    const whereCondition = parentId 
      ? and(eq(folders.companyId, companyId), eq(folders.parentId, parentId))
      : and(eq(folders.companyId, companyId), eq(folders.parentId, null));
    
    return await db.select()
      .from(folders)
      .where(whereCondition)
      .orderBy(folders.name);
  }

  async getFolder(id: number): Promise<Folder | undefined> {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));
    return folder || undefined;
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const [folder] = await db.insert(folders).values(insertFolder).returning();
    return folder;
  }

  async updateFolder(id: number, updateData: Partial<InsertFolder>): Promise<Folder> {
    const [folder] = await db.update(folders).set(updateData).where(eq(folders.id, id)).returning();
    return folder;
  }

  async deleteFolder(id: number): Promise<void> {
    await db.delete(folders).where(eq(folders.id, id));
  }

  // File Permissions
  async getFilePermissions(fileId: number): Promise<FilePermission[]> {
    return await db.select()
      .from(filePermissions)
      .where(eq(filePermissions.fileId, fileId));
  }

  async createFilePermission(insertPermission: InsertFilePermission): Promise<FilePermission> {
    const [permission] = await db.insert(filePermissions).values(insertPermission).returning();
    return permission;
  }

  async updateFilePermission(id: number, updateData: Partial<InsertFilePermission>): Promise<FilePermission> {
    const [permission] = await db.update(filePermissions).set(updateData).where(eq(filePermissions.id, id)).returning();
    return permission;
  }

  async deleteFilePermission(id: number): Promise<void> {
    await db.delete(filePermissions).where(eq(filePermissions.id, id));
  }

  // Folder Permissions
  async getFolderPermissions(folderId: number): Promise<FolderPermission[]> {
    return await db.select()
      .from(folderPermissions)
      .where(eq(folderPermissions.folderId, folderId));
  }

  async createFolderPermission(insertPermission: InsertFolderPermission): Promise<FolderPermission> {
    const [permission] = await db.insert(folderPermissions).values(insertPermission).returning();
    return permission;
  }

  async updateFolderPermission(id: number, updateData: Partial<InsertFolderPermission>): Promise<FolderPermission> {
    const [permission] = await db.update(folderPermissions).set(updateData).where(eq(folderPermissions.id, id)).returning();
    return permission;
  }

  async deleteFolderPermission(id: number): Promise<void> {
    await db.delete(folderPermissions).where(eq(folderPermissions.id, id));
  }

  // File Access Logs
  async getFileAccessLogs(fileId: number, limit: number = 50): Promise<FileAccessLog[]> {
    return await db.select()
      .from(fileAccessLogs)
      .where(eq(fileAccessLogs.fileId, fileId))
      .orderBy(desc(fileAccessLogs.accessedAt))
      .limit(limit);
  }

  async createFileAccessLog(insertLog: InsertFileAccessLog): Promise<FileAccessLog> {
    const [log] = await db.insert(fileAccessLogs).values(insertLog).returning();
    return log;
  }

  // File Shares
  async getFileShare(shareId: string): Promise<FileShare | undefined> {
    const [share] = await db.select().from(fileShares).where(eq(fileShares.shareId, shareId));
    return share || undefined;
  }

  async getFileShares(fileId: number): Promise<FileShare[]> {
    return await db.select()
      .from(fileShares)
      .where(eq(fileShares.fileId, fileId));
  }

  async createFileShare(insertShare: InsertFileShare): Promise<FileShare> {
    const [share] = await db.insert(fileShares).values(insertShare).returning();
    return share;
  }

  async updateFileShare(id: number, updateData: Partial<InsertFileShare>): Promise<FileShare> {
    const [share] = await db.update(fileShares).set(updateData).where(eq(fileShares.id, id)).returning();
    return share;
  }

  async deleteFileShare(id: number): Promise<void> {
    await db.delete(fileShares).where(eq(fileShares.id, id));
  }

  // File Comments
  async getFileComments(fileId: number): Promise<FileComment[]> {
    return await db.select()
      .from(fileComments)
      .where(eq(fileComments.fileId, fileId))
      .orderBy(desc(fileComments.createdAt));
  }

  async createFileComment(insertComment: InsertFileComment): Promise<FileComment> {
    const [comment] = await db.insert(fileComments).values(insertComment).returning();
    return comment;
  }

  async updateFileComment(id: number, updateData: Partial<InsertFileComment>): Promise<FileComment> {
    const [comment] = await db.update(fileComments).set(updateData).where(eq(fileComments.id, id)).returning();
    return comment;
  }

  async deleteFileComment(id: number): Promise<void> {
    await db.delete(fileComments).where(eq(fileComments.id, id));
  }

  // Vault Settings
  async getVaultSettings(companyId: number): Promise<VaultSettings | undefined> {
    const [settings] = await db.select().from(vaultSettings).where(eq(vaultSettings.companyId, companyId));
    return settings || undefined;
  }

  async createVaultSettings(insertSettings: InsertVaultSettings): Promise<VaultSettings> {
    const [settings] = await db.insert(vaultSettings).values(insertSettings).returning();
    return settings;
  }

  async updateVaultSettings(companyId: number, updateData: Partial<InsertVaultSettings>): Promise<VaultSettings> {
    const [settings] = await db.update(vaultSettings).set(updateData).where(eq(vaultSettings.companyId, companyId)).returning();
    return settings;
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
