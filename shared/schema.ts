import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("employee"), // admin, compliance, it, employee
  companyId: integer("company_id").references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  size: text("size"), // small, medium, large
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Risk assessments table
export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  responses: jsonb("responses").notNull(), // Store assessment responses
  physicalSecurityScore: integer("physical_security_score").notNull(),
  dataProtectionScore: integer("data_protection_score").notNull(),
  accessControlScore: integer("access_control_score").notNull(),
  networkSecurityScore: integer("network_security_score").notNull(),
  overallScore: integer("overall_score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Folders table
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  parentId: integer("parent_id").references(() => folders.id),
  name: text("name").notNull(),
  description: text("description"),
  path: text("path").notNull(),
  color: text("color").default("#374151"),
  isSystemFolder: boolean("is_system_folder").default(false).notNull(),
  complianceType: text("compliance_type", { enum: ["popia", "sars", "hr", "legal", "general"] }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enhanced Files table
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  folderId: integer("folder_id").references(() => folders.id),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  type: text("type").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  encryptionKey: text("encryption_key").notNull(),
  checksum: text("checksum").notNull(),
  tags: text("tags").array().default([]),
  description: text("description"),
  version: integer("version").default(1).notNull(),
  isLatestVersion: boolean("is_latest_version").default(true).notNull(),
  parentFileId: integer("parent_file_id").references(() => files.id),
  downloadCount: integer("download_count").default(0).notNull(),
  lastAccessedAt: timestamp("last_accessed_at"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  status: text("status", { enum: ["active", "deleted", "quarantined"] }).default("active").notNull(),
  virusScanStatus: text("virus_scan_status", { enum: ["pending", "clean", "infected", "failed"] }).default("pending").notNull(),
  retentionPolicy: text("retention_policy"),
  expiresAt: timestamp("expires_at"),
});

// File Permissions table
export const filePermissions = pgTable("file_permissions", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").references(() => files.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  role: text("role"),
  permissions: text("permissions").array().notNull(), // ["view", "download", "edit", "delete", "share"]
  grantedBy: integer("granted_by").references(() => users.id).notNull(),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Folder Permissions table
export const folderPermissions = pgTable("folder_permissions", {
  id: serial("id").primaryKey(),
  folderId: integer("folder_id").references(() => folders.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  role: text("role"),
  permissions: text("permissions").array().notNull(), // ["view", "upload", "create_subfolder", "edit", "delete"]
  grantedBy: integer("granted_by").references(() => users.id).notNull(),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// File Access Logs table
export const fileAccessLogs = pgTable("file_access_logs", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").references(() => files.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action", { enum: ["view", "download", "upload", "edit", "delete", "share", "preview"] }).notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  deviceInfo: text("device_info"),
  location: text("location"),
  success: boolean("success").default(true).notNull(),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// File Shares table
export const fileShares = pgTable("file_shares", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").references(() => files.id).notNull(),
  shareId: text("share_id").unique().notNull(),
  shareType: text("share_type", { enum: ["public", "private", "password", "otp"] }).notNull(),
  accessLevel: text("access_level", { enum: ["view", "download"] }).default("view").notNull(),
  password: text("password"),
  maxAccess: integer("max_access"),
  currentAccess: integer("current_access").default(0).notNull(),
  allowDownload: boolean("allow_download").default(false).notNull(),
  watermark: boolean("watermark").default(false).notNull(),
  notifyOnAccess: boolean("notify_on_access").default(false).notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  lastAccessedAt: timestamp("last_accessed_at"),
});

// File Comments table
export const fileComments = pgTable("file_comments", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").references(() => files.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id").references(() => fileComments.id),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vault Settings table
export const vaultSettings = pgTable("vault_settings", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  maxStorageGB: integer("max_storage_gb").default(100).notNull(),
  allowedFileTypes: text("allowed_file_types").array().default(["pdf", "doc", "docx", "xls", "xlsx", "txt", "jpg", "png"]),
  maxFileSize: integer("max_file_size").default(104857600).notNull(), // 100MB default
  enableVirusScanning: boolean("enable_virus_scanning").default(true).notNull(),
  enableVersionControl: boolean("enable_version_control").default(true).notNull(),
  defaultRetentionDays: integer("default_retention_days").default(2555).notNull(), // 7 years
  requireMFA: boolean("require_mfa").default(false).notNull(),
  watermarkDownloads: boolean("watermark_downloads").default(false).notNull(),
  blockDownloads: boolean("block_downloads").default(false).notNull(),
  notificationSettings: jsonb("notification_settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// POPIA compliance items table
export const popiaItems = pgTable("popia_items", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  completedBy: integer("completed_by").references(() => users.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  action: text("action").notNull(), // upload, download, delete, access
  resource: text("resource").notNull(), // file name or resource identifier
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, success, error
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  riskAssessments: many(riskAssessments),
  uploadedFiles: many(files),
  activityLogs: many(activityLogs),
  notifications: many(notifications),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  riskAssessments: many(riskAssessments),
  files: many(files),
  popiaItems: many(popiaItems),
  activityLogs: many(activityLogs),
}));

export const riskAssessmentsRelations = relations(riskAssessments, ({ one }) => ({
  company: one(companies, {
    fields: [riskAssessments.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [riskAssessments.userId],
    references: [users.id],
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  uploadedByUser: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [files.companyId],
    references: [companies.id],
  }),
}));

export const popiaItemsRelations = relations(popiaItems, ({ one }) => ({
  company: one(companies, {
    fields: [popiaItems.companyId],
    references: [companies.id],
  }),
  completedByUser: one(users, {
    fields: [popiaItems.completedBy],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [activityLogs.companyId],
    references: [companies.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  createdAt: true,
});

// Insert schemas
export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadedAt: true,
  lastAccessedAt: true,
  downloadCount: true,
  virusScanStatus: true,
});

export const insertFilePermissionSchema = createInsertSchema(filePermissions).omit({
  id: true,
  grantedAt: true,
});

export const insertFolderPermissionSchema = createInsertSchema(folderPermissions).omit({
  id: true,
  grantedAt: true,
});

export const insertFileAccessLogSchema = createInsertSchema(fileAccessLogs).omit({
  id: true,
  timestamp: true,
});

export const insertFileShareSchema = createInsertSchema(fileShares).omit({
  id: true,
  createdAt: true,
  lastAccessedAt: true,
  currentAccess: true,
});

export const insertFileCommentSchema = createInsertSchema(fileComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVaultSettingsSchema = createInsertSchema(vaultSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPopiaItemSchema = createInsertSchema(popiaItems).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type FilePermission = typeof filePermissions.$inferSelect;
export type InsertFilePermission = z.infer<typeof insertFilePermissionSchema>;
export type FolderPermission = typeof folderPermissions.$inferSelect;
export type InsertFolderPermission = z.infer<typeof insertFolderPermissionSchema>;
export type FileAccessLog = typeof fileAccessLogs.$inferSelect;
export type InsertFileAccessLog = z.infer<typeof insertFileAccessLogSchema>;
export type FileShare = typeof fileShares.$inferSelect;
export type InsertFileShare = z.infer<typeof insertFileShareSchema>;
export type FileComment = typeof fileComments.$inferSelect;
export type InsertFileComment = z.infer<typeof insertFileCommentSchema>;
export type VaultSettings = typeof vaultSettings.$inferSelect;
export type InsertVaultSettings = z.infer<typeof insertVaultSettingsSchema>;
export type PopiaItem = typeof popiaItems.$inferSelect;
export type InsertPopiaItem = z.infer<typeof insertPopiaItemSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
