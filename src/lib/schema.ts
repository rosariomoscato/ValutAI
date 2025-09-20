import { pgTable, text, timestamp, boolean, integer, numeric, jsonb } from "drizzle-orm/pg-core";

// Auth tables (existing)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified"),
  image: text("image"),
  role: text("role").default("viewer").notNull(), // owner, analyst, viewer
  credits: integer("credits").default(0).notNull(), // Starting credits for new users (0 + 50 welcome bonus)
  stripeCustomerId: text("stripeCustomerId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  hasReceivedFreeCredits: boolean("hasReceivedFreeCredits").default(false).notNull(), // Track if user received free credits
  previousEmailsForFreeCredits: jsonb("previousEmailsForFreeCredits").default([]).notNull(), // Track emails that received free credits to prevent reuse
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// ValutAI tables
export const dataset = pgTable("dataset", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  fileName: text("fileName").notNull(),
  fileSize: integer("fileSize").notNull(),
  rowCount: integer("rowCount").notNull(),
  columnMapping: jsonb("columnMapping").notNull(),
  status: text("status").default("processing").notNull(), // processing, ready, error
  errorMessage: text("errorMessage"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const quote = pgTable("quote", {
  id: text("id").primaryKey(),
  datasetId: text("datasetId")
    .notNull()
    .references(() => dataset.id, { onDelete: "cascade" }),
  
  // Raw data fields
  customerSector: text("customerSector"),
  customerSize: text("customerSize"),
  discountPercentage: numeric("discountPercentage"),
  totalPrice: numeric("totalPrice"),
  deliveryTime: integer("deliveryTime"), // in days
  channel: text("channel"),
  salesRep: text("salesRep"),
  leadSource: text("leadSource"),
  
  // Outcome
  outcome: text("outcome").notNull(), // won, lost
  outcomeDate: timestamp("outcomeDate"),
  
  // Derived features
  discountAmount: numeric("discountAmount"),
  averageTicket: numeric("averageTicket"),
  responseTime: integer("responseTime"), // in hours
  
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const model = pgTable("model", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  datasetId: text("datasetId")
    .notNull()
    .references(() => dataset.id, { onDelete: "cascade" }),
  
  // Model configuration
  algorithm: text("algorithm").default("logistic_regression").notNull(),
  hyperparameters: jsonb("hyperparameters").notNull(),
  
  // Training metrics
  accuracy: numeric("accuracy"),
  precision: numeric("precision"),
  recall: numeric("recall"),
  f1Score: numeric("f1Score"),
  aucRoc: numeric("aucRoc"),
  brierScore: numeric("brierScore"),
  
  // Feature importance
  featureImportance: jsonb("featureImportance"),
  
  // Status
  status: text("status").default("training").notNull(), // training, ready, error
  errorMessage: text("errorMessage"),
  trainingTime: integer("trainingTime"), // in seconds
  
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const prediction = pgTable("prediction", {
  id: text("id").primaryKey(),
  modelId: text("modelId")
    .notNull()
    .references(() => model.id, { onDelete: "cascade" }),
  
  // Input features
  customerSector: text("customerSector"),
  customerSize: text("customerSize"),
  discountPercentage: numeric("discountPercentage"),
  totalPrice: numeric("totalPrice"),
  deliveryTime: integer("deliveryTime"),
  channel: text("channel"),
  salesRep: text("salesRep"),
  leadSource: text("leadSource"),
  
  // Prediction results
  winProbability: numeric("winProbability").notNull(),
  confidence: numeric("confidence").notNull(),
  featureContributions: jsonb("featureContributions"),
  recommendations: jsonb("recommendations"),
  
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const report = pgTable("report", {
  id: text("id").primaryKey(),
  modelId: text("modelId")
    .notNull()
    .references(() => model.id, { onDelete: "cascade" }),
  
  title: text("title").notNull(),
  content: jsonb("content").notNull(), // Report sections and data
  insights: jsonb("insights").notNull(), // Key findings and recommendations
  
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Credits System tables
export const creditTransaction = pgTable("credit_transaction", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  type: text("type").notNull(), // 'purchase', 'usage', 'refund', 'bonus'
  amount: integer("amount").notNull(), // Positive for purchases/refunds, negative for usage
  balance: integer("balance").notNull(), // Balance after transaction
  description: text("description").notNull(),
  operationType: text("operationType"), // 'dataset_upload', 'model_training', 'prediction', 'report_generation', 'credit_purchase'
  resourceId: text("resourceId"), // ID of related resource (dataset, model, etc.)
  
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const creditPackage = pgTable("credit_package", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  price: numeric("price").notNull(), // In euros
  currency: text("currency").default("EUR").notNull(),
  stripePriceId: text("stripePriceId"),
  isActive: boolean("isActive").default(true).notNull(),
  isPopular: boolean("isPopular").default(false).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const creditOperation = pgTable("credit_operation", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  creditCost: integer("creditCost").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Table to track emails that have received free credits to prevent reuse
export const deletedUserEmails = pgTable("deleted_user_emails", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  hasReceivedFreeCredits: boolean("hasReceivedFreeCredits").default(false).notNull(),
  deletedAt: timestamp("deletedAt").notNull().defaultNow(),
});
