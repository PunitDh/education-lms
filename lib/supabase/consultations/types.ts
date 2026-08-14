export type Consultation = {
  id: string;
  firstName: string;
  lastName: string;
  reason: string;
  consultationAt: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: ConsultationStatus;
};

export enum ConsultationStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export type SearchConsultationUserId = Pick<Consultation, "userId">;
