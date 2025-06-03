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

// Files table
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  encryptedPath: text("encrypted_path").notNull(),
  accessLevel: text("access_level").notNull(), // all_staff, admin, compliance, it, hr, legal
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
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
export type PopiaItem = typeof popiaItems.$inferSelect;
export type InsertPopiaItem = z.infer<typeof insertPopiaItemSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
