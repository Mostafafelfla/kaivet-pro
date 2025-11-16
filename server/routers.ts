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
  getPatientById,
  getAppointmentsByClinicId,
  getAppointmentsByPatientId,
  getCasesByClinicId,
  getCasesByPatientId,
  getCaseById,
  getInventoryByClinicId,
  getSuppliersByClinicId,
  getTransactionsByClinicId,
  getChatSessionsByUserId,
  getChatMessagesBySessionId,
  getPromotionsByClinicId,
  getTodosByClinicId,
  getTodosByUserId,
  getVaccinationsByPatientId,
  getVaccinationsByClinicId,
  getOverdueVaccinations,
  getMedicalTestsByPatientId,
  getMedicalTestsByCaseId,
  getPrescriptionsByCaseId,
  getPrescriptionsByPatientId,
  getActivePrescriptions,
  getLowStockItems,
  getDb,
} from "./db";
import { TRPCError } from "@trpc/server";
import { 
  clinics, veterinarians, services, patients, appointments, cases, 
  inventory, suppliers, transactions, chatSessions, chatMessages, promotions, todos,
  vaccinations, medicalTests, prescriptions
} from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";

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

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getPatientById(input.id);
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
        allergies: z.string().optional(),
        bloodType: z.string().optional(),
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

  // Vaccination management
  vaccination: router({
    listByPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getVaccinationsByPatientId(input.patientId);
      }),

    listByClinic: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getVaccinationsByClinicId(input.clinicId);
      }),

    getOverdue: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getOverdueVaccinations(input.clinicId);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        patientId: z.number(),
        veterinarianId: z.number().optional(),
        vaccineName: z.string().min(1),
        vaccineType: z.string().optional(),
        batchNumber: z.string().optional(),
        administrationDate: z.date(),
        nextDueDate: z.date().optional(),
        route: z.string().optional(),
        site: z.string().optional(),
        dosage: z.string().optional(),
        manufacturer: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.insert(vaccinations).values({
          ...input,
          status: "completed",
        });

        return result;
      }),
  }),

  // Medical test management
  medicalTest: router({
    listByPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getMedicalTestsByPatientId(input.patientId);
      }),

    listByCase: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return getMedicalTestsByCaseId(input.caseId);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        patientId: z.number(),
        caseId: z.number().optional(),
        testType: z.string().min(1),
        testName: z.string().min(1),
        testDate: z.date(),
        results: z.string().optional(),
        normalRange: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.insert(medicalTests).values({
          ...input,
          status: "pending",
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

  // Case management (Medical cases)
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

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getCaseById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        patientId: z.number(),
        veterinarianId: z.number().optional(),
        title: z.string().min(1),
        symptoms: z.string().optional(),
        diagnosis: z.string().optional(),
        treatment: z.string().optional(),
        prescription: z.string().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        prognosis: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const caseNumber = `CASE-${Date.now()}`;
        const result = await db.insert(cases).values({
          ...input,
          caseNumber,
          status: "open",
        });

        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        clinicId: z.number(),
        symptoms: z.string().optional(),
        diagnosis: z.string().optional(),
        treatment: z.string().optional(),
        prescription: z.string().optional(),
        followUpNotes: z.string().optional(),
        status: z.enum(["open", "in_progress", "closed"]).optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        prognosis: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const { id, clinicId, ...updateData } = input;
        await db.update(cases).set(updateData).where(eq(cases.id, id));
        return getCaseById(id);
      }),
  }),

  // Prescription management
  prescription: router({
    listByCase: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return getPrescriptionsByCaseId(input.caseId);
      }),

    listByPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getPrescriptionsByPatientId(input.patientId);
      }),

    listActive: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getActivePrescriptions(input.patientId);
      }),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        caseId: z.number(),
        patientId: z.number(),
        medicationName: z.string().min(1),
        dosage: z.string().min(1),
        frequency: z.string().min(1),
        duration: z.string().optional(),
        route: z.string().optional(),
        instructions: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        refills: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const clinic = await getClinicById(input.clinicId);
        if (!clinic || clinic.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.insert(prescriptions).values({
          ...input,
          status: "active",
        });

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

    getLowStock: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getLowStockItems(input.clinicId);
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

  // AI Chat management with medical consultation
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
        patientId: z.number().optional(),
        title: z.string().optional(),
        context: z.string().optional(),
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

    sendMessage: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Save user message
        await db.insert(chatMessages).values({
          sessionId: input.sessionId,
          role: "user" as const,
          content: input.content,
        });

        // Get AI response
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system" as const,
                content: "You are an expert veterinary consultant AI. Provide professional medical advice for veterinary cases. Always recommend consulting with a licensed veterinarian for serious conditions. Be concise and clear."
              },
              {
                role: "user" as const,
                content: input.content
              }
            ]
          });

          const aiMessage = typeof response.choices[0]?.message?.content === 'string' 
          ? response.choices[0].message.content 
          : "I couldn't generate a response. Please try again.";

          // Save AI response
          await db.insert(chatMessages).values({
            sessionId: input.sessionId,
            role: "assistant" as const,
            content: aiMessage,
          });

          return {
            success: true,
            userMessage: input.content,
            aiMessage: aiMessage
          };
        } catch (error) {
          console.error("AI error:", error);
          // Return a fallback response instead of throwing
          const fallbackMessage = "I'm having trouble processing your request. Please try again or consult with a veterinarian directly.";
          
          await db.insert(chatMessages).values({
            sessionId: input.sessionId,
            role: "assistant" as const,
            content: fallbackMessage,
          });
          
          return {
            success: false,
            userMessage: input.content,
            aiMessage: fallbackMessage
          };
        }
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
