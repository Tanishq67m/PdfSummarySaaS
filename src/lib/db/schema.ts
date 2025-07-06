import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadthingId: text("uploadthing_id").notNull(),
  status: text("status").notNull().default("uploaded"), // uploaded, processing, completed, error
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id")
    .notNull()
    .references(() => documents.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  keyPoints: jsonb("key_points").$type<string[]>(),
  actionItems: jsonb("action_items").$type<string[]>(),
  tags: jsonb("tags").$type<string[]>(),
  wordCount: integer("word_count"),
  processingTime: integer("processing_time"), // in seconds
  aiModel: text("ai_model").notNull().default("gpt-4"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const processingLogs = pgTable("processing_logs", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id")
    .notNull()
    .references(() => documents.id),
  stage: text("stage").notNull(), // extraction, analysis, summary_generation
  status: text("status").notNull(), // started, completed, error
  message: text("message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
