import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import {
  getClinicById,
  getClinicsByOwnerId,
  getVeterinariansByClinicId,
  getServicesByClinicId,
  getPatientsByClinicId,
  getPatientsByOwnerId,
  getAppointmentsByClinicId,
  getAppointmentsByPatientId,
  getCasesByClinicId,
  getCasesByPatientId,
  getInventoryByClinicId,
  getSuppliersByClinicId,
  getTransactionsByClinicId,
  getChatSessionsByUserId,
  getChatMessagesBySessionId,
  getPromotionsByClinicId,
  getTodosByClinicId,
  getTodosByUserId,
  getDb,
} from "./db";
import { TRPCError } from "@trpc/server";
import { clinics, veterinarians, services, patients, appointments, cases, inventory, suppliers, transactions, chatSessions, chatMessages, promotions, todos } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Clinic management
  clinic: router({
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getClinicById(input.id);
      }),

    listByOwner: protectedProcedure
      .query(async ({ ctx }) => {
        return getClinicsByOwnerId(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db.insert(clinics).values({
          ...input,
          ownerId: ctx.user.id,
          subscriptionStatus: "active",
        });

        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.id);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const { id, ...updateData } = input;
        await db.update(clinics).set(updateData).where(eq(clinics.id, id));
        return getClinicById(id);
      }),
  }),

  // Veterinarian management
  veterinarian: router({
    listByClinic: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getVeterinariansByClinicId(input.clinicId);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        specialization: z.string().optional(),
        licenseNumber: z.string().optional(),
        bio: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.insert(veterinarians).values(input);
        return result;
      }),
  }),

  // Service management
  service: router({
    listByClinic: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getServicesByClinicId(input.clinicId);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.string().optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.insert(services).values(input);
        return result;
      }),
  }),

  // Patient management
  patient: router({
    listByClinic: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getPatientsByClinicId(input.clinicId);
      }),

    listByOwner: protectedProcedure
      .query(async ({ ctx }) => {
        return getPatientsByOwnerId(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        name: z.string().min(1),
        species: z.string().optional(),
        breed: z.string().optional(),
        age: z.number().optional(),
        weight: z.string().optional(),
        color: z.string().optional(),
        microchipId: z.string().optional(),
        medicalHistory: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db.insert(patients).values({
          ...input,
          ownerId: ctx.user.id,
        });

        return result;
      }),
  }),

  // Appointment management
  appointment: router({
    listByClinic: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getAppointmentsByClinicId(input.clinicId);
      }),

    listByPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getAppointmentsByPatientId(input.patientId);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        patientId: z.number(),
        veterinarianId: z.number().optional(),
        serviceId: z.number().optional(),
        appointmentDate: z.date(),
        duration: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.insert(appointments).values(input);
        return result;
      }),
  }),

  // Case management
  case: router({
    listByClinic: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getCasesByClinicId(input.clinicId);
      }),

    listByPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getCasesByPatientId(input.patientId);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        patientId: z.number(),
        veterinarianId: z.number().optional(),
        title: z.string().min(1),
        diagnosis: z.string().optional(),
        treatment: z.string().optional(),
        prescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.insert(cases).values(input);
        return result;
      }),
  }),

  // Inventory management
  inventory: router({
    listByClinic: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getInventoryByClinicId(input.clinicId);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        name: z.string().min(1),
        category: z.string().optional(),
        quantity: z.number(),
        minQuantity: z.number().optional(),
        unit: z.string().optional(),
        costPrice: z.string().optional(),
        sellingPrice: z.string().optional(),
        supplierId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.insert(inventory).values(input);
        return result;
      }),
  }),

  // Supplier management
  supplier: router({
    listByClinic: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getSuppliersByClinicId(input.clinicId);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        contactPerson: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.insert(suppliers).values(input);
        return result;
      }),
  }),

  // Transaction management
  transaction: router({
    listByClinic: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getTransactionsByClinicId(input.clinicId);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        appointmentId: z.number().optional(),
        patientId: z.number().optional(),
        type: z.enum(["service", "product", "consultation"]),
        amount: z.string(),
        paymentMethod: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.insert(transactions).values(input);
        return result;
      }),
  }),

  // Chat management
  chat: router({
    listSessions: protectedProcedure
      .query(async ({ ctx }) => {
        return getChatSessionsByUserId(ctx.user.id);
      }),

    getMessages: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return getChatMessagesBySessionId(input.sessionId);
      }),

    createSession: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        title: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db.insert(chatSessions).values({
          ...input,
          userId: ctx.user.id,
        });

        return result;
      }),

    addMessage: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db.insert(chatMessages).values(input);
        return result;
      }),
  }),

  // Promotion management
  promotion: router({
    listByClinic: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getPromotionsByClinicId(input.clinicId);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.insert(promotions).values(input);
        return result;
      }),
  }),

  // Todo management
  todo: router({
    listByClinic: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getTodosByClinicId(input.clinicId);
      }),

    listByUser: protectedProcedure
      .query(async ({ ctx }) => {
        return getTodosByUserId(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.insert(todos).values({
          ...input,
          userId: ctx.user.id,
        });

        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
