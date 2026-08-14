import z from "zod";
import { ConsultationStatus } from "./types";

const consultationFields = {
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  reason: z.string().trim().min(1).max(200),
  consultationAt: z.iso.datetime({ offset: true }),
};

export const createConsultationSchema = z.strictObject(consultationFields);

export const editConsultationSchema = z.strictObject(consultationFields);

export const changeStatusSchema = z.strictObject({
  status: z.enum(ConsultationStatus),
});

export type CreateConsultationDto = z.infer<typeof createConsultationSchema>;

export type EditConsultationDto = z.infer<typeof editConsultationSchema>;

export type ChangeStatusDto = z.infer<typeof changeStatusSchema>;
