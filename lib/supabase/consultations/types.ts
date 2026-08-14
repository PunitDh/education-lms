export type Consultation = {
  id: string;
  firstName: string;
  lastName: string;
  reason: string;
  consultationAt: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type CreateConsultation = {
  firstName: string;
  lastName: string;
  reason: string;
  consultationAt: string;
};

export type SearchConsultationUserId = Pick<Consultation, "userId">;
