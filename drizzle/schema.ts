import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, datetime, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for veterinary clinic management.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "clinic_owner", "veterinarian", "staff", "client"]).default("client").notNull(),
  clinicId: int("clinicId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clinic information and settings
 */
export const clinics = mysqlTable("clinics", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  logo: varchar("logo", { length: 500 }),
  description: text("description"),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "inactive", "suspended"]).default("active").notNull(),
  subscriptionEndDate: datetime("subscriptionEndDate"),
  ownerId: int("ownerId").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Clinic = typeof clinics.$inferSelect;
export type InsertClinic = typeof clinics.$inferInsert;

/**
 * Veterinarians/Doctors
 */
export const veterinarians = mysqlTable("veterinarians", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  specialization: varchar("specialization", { length: 255 }),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  photo: varchar("photo", { length: 500 }),
  bio: text("bio"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Veterinarian = typeof veterinarians.$inferSelect;
export type InsertVeterinarian = typeof veterinarians.$inferInsert;

/**
 * Clinic services offered
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  duration: int("duration"), // in minutes
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Patients (animals)
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  species: varchar("species", { length: 100 }),
  breed: varchar("breed", { length: 100 }),
  age: int("age"),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  color: varchar("color", { length: 100 }),
  microchipId: varchar("microchipId", { length: 100 }),
  photo: varchar("photo", { length: 500 }),
  medicalHistory: text("medicalHistory"),
  allergies: text("allergies"),
  bloodType: varchar("bloodType", { length: 50 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Vaccination records
 */
export const vaccinations = mysqlTable("vaccinations", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  veterinarianId: int("veterinarianId"),
  vaccineName: varchar("vaccineName", { length: 255 }).notNull(),
  vaccineType: varchar("vaccineType", { length: 100 }),
  batchNumber: varchar("batchNumber", { length: 100 }),
  administrationDate: datetime("administrationDate").notNull(),
  nextDueDate: datetime("nextDueDate"),
  route: varchar("route", { length: 50 }), // oral, injection, etc
  site: varchar("site", { length: 100 }), // injection site
  dosage: varchar("dosage", { length: 100 }),
  manufacturer: varchar("manufacturer", { length: 255 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["completed", "pending", "overdue"]).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vaccination = typeof vaccinations.$inferSelect;
export type InsertVaccination = typeof vaccinations.$inferInsert;

/**
 * Medical tests and lab results
 */
export const medicalTests = mysqlTable("medicalTests", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  caseId: int("caseId"),
  testType: varchar("testType", { length: 100 }).notNull(),
  testName: varchar("testName", { length: 255 }).notNull(),
  testDate: datetime("testDate").notNull(),
  results: text("results"),
  normalRange: varchar("normalRange", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "abnormal"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MedicalTest = typeof medicalTests.$inferSelect;
export type InsertMedicalTest = typeof medicalTests.$inferInsert;

/**
 * Appointments
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  veterinarianId: int("veterinarianId"),
  serviceId: int("serviceId"),
  appointmentDate: datetime("appointmentDate").notNull(),
  duration: int("duration"), // in minutes
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no_show"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Medical cases/treatments
 */
export const cases = mysqlTable("cases", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  veterinarianId: int("veterinarianId"),
  title: varchar("title", { length: 255 }).notNull(),
  caseNumber: varchar("caseNumber", { length: 50 }).unique(),
  symptoms: text("symptoms"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  prescription: text("prescription"),
  followUpNotes: text("followUpNotes"),
  status: mysqlEnum("status", ["open", "in_progress", "closed"]).default("open").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  prognosis: text("prognosis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;

/**
 * Prescriptions
 */
export const prescriptions = mysqlTable("prescriptions", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  caseId: int("caseId").notNull(),
  patientId: int("patientId").notNull(),
  medicationName: varchar("medicationName", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 100 }).notNull(),
  duration: varchar("duration", { length: 100 }),
  route: varchar("route", { length: 50 }), // oral, injection, topical, etc
  instructions: text("instructions"),
  startDate: datetime("startDate"),
  endDate: datetime("endDate"),
  refills: int("refills"),
  status: mysqlEnum("status", ["active", "completed", "discontinued"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = typeof prescriptions.$inferInsert;

/**
 * Inventory management
 */
export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  quantity: int("quantity").notNull(),
  minQuantity: int("minQuantity"),
  unit: varchar("unit", { length: 50 }),
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }),
  sellingPrice: decimal("sellingPrice", { precision: 10, scale: 2 }),
  expiryDate: datetime("expiryDate"),
  supplierId: int("supplierId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = typeof inventory.$inferInsert;

/**
 * Suppliers
 */
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  contactPerson: varchar("contactPerson", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

/**
 * Sales transactions
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  appointmentId: int("appointmentId"),
  patientId: int("patientId"),
  type: mysqlEnum("type", ["service", "product", "consultation"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * AI Chat sessions for medical consultation
 */
export const chatSessions = mysqlTable("chatSessions", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  userId: int("userId").notNull(),
  patientId: int("patientId"),
  title: varchar("title", { length: 255 }),
  context: text("context"), // medical context for AI
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

/**
 * Chat messages with AI
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"), // store additional data like suggestions, confidence scores
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Promotions and discounts
 */
export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  startDate: datetime("startDate"),
  endDate: datetime("endDate"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;

/**
 * Todo/task management
 */
export const todos = mysqlTable("todos", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending").notNull(),
  dueDate: datetime("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Todo = typeof todos.$inferSelect;
export type InsertTodo = typeof todos.$inferInsert;
