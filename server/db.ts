import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, clinics, veterinarians, services, patients, appointments, cases, 
  inventory, suppliers, transactions, chatSessions, chatMessages, promotions, todos,
  vaccinations, medicalTests, prescriptions
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Clinic queries
export async function getClinicById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clinics).where(eq(clinics.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getClinicsByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clinics).where(eq(clinics.ownerId, ownerId));
}

// Veterinarian queries
export async function getVeterinariansByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(veterinarians).where(eq(veterinarians.clinicId, clinicId));
}

// Service queries
export async function getServicesByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services).where(eq(services.clinicId, clinicId));
}

// Patient queries
export async function getPatientsByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patients).where(eq(patients.clinicId, clinicId));
}

export async function getPatientsByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patients).where(eq(patients.ownerId, ownerId));
}

export async function getPatientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Vaccination queries
export async function getVaccinationsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vaccinations).where(eq(vaccinations.patientId, patientId)).orderBy(desc(vaccinations.administrationDate));
}

export async function getVaccinationsByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vaccinations).where(eq(vaccinations.clinicId, clinicId)).orderBy(desc(vaccinations.administrationDate));
}

export async function getOverdueVaccinations(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vaccinations)
    .where(and(
      eq(vaccinations.clinicId, clinicId),
      eq(vaccinations.status, "overdue")
    ))
    .orderBy(desc(vaccinations.nextDueDate));
}

// Medical test queries
export async function getMedicalTestsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(medicalTests).where(eq(medicalTests.patientId, patientId)).orderBy(desc(medicalTests.testDate));
}

export async function getMedicalTestsByCaseId(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(medicalTests).where(eq(medicalTests.caseId, caseId)).orderBy(desc(medicalTests.testDate));
}

// Appointment queries
export async function getAppointmentsByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.clinicId, clinicId)).orderBy(desc(appointments.appointmentDate));
}

export async function getAppointmentsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.patientId, patientId)).orderBy(desc(appointments.appointmentDate));
}

// Case queries
export async function getCasesByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cases).where(eq(cases.clinicId, clinicId)).orderBy(desc(cases.createdAt));
}

export async function getCasesByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cases).where(eq(cases.patientId, patientId)).orderBy(desc(cases.createdAt));
}

export async function getCaseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Prescription queries
export async function getPrescriptionsByCaseId(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(prescriptions).where(eq(prescriptions.caseId, caseId)).orderBy(desc(prescriptions.createdAt));
}

export async function getPrescriptionsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(prescriptions).where(eq(prescriptions.patientId, patientId)).orderBy(desc(prescriptions.createdAt));
}

export async function getActivePrescriptions(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(prescriptions)
    .where(and(
      eq(prescriptions.patientId, patientId),
      eq(prescriptions.status, "active")
    ))
    .orderBy(desc(prescriptions.createdAt));
}

// Inventory queries
export async function getInventoryByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inventory).where(eq(inventory.clinicId, clinicId)).orderBy(desc(inventory.updatedAt));
}

export async function getLowStockItems(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  // This is a simplified version - in production, you'd use a raw query for better performance
  const items = await db.select().from(inventory).where(eq(inventory.clinicId, clinicId));
  return items.filter(item => item.quantity <= (item.minQuantity || 5));
}

// Supplier queries
export async function getSuppliersByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suppliers).where(eq(suppliers.clinicId, clinicId));
}

// Transaction queries
export async function getTransactionsByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).where(eq(transactions.clinicId, clinicId)).orderBy(desc(transactions.createdAt));
}

// Chat queries
export async function getChatSessionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatSessions).where(eq(chatSessions.userId, userId)).orderBy(desc(chatSessions.updatedAt));
}

export async function getChatMessagesBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(desc(chatMessages.createdAt));
}

// Promotion queries
export async function getPromotionsByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(promotions).where(eq(promotions.clinicId, clinicId));
}

// Todo queries
export async function getTodosByClinicId(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(todos).where(eq(todos.clinicId, clinicId)).orderBy(desc(todos.createdAt));
}

export async function getTodosByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(todos).where(eq(todos.userId, userId)).orderBy(desc(todos.createdAt));
}
