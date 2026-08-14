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

export type CreateConsultationDto = Pick<
  Consultation,
  "firstName" | "lastName" | "reason" | "consultationAt"
>;

export type EditConsultationDto = Pick<
  Consultation,
  "firstName" | "lastName" | "reason" | "consultationAt"
>;

export type SearchConsultationUserId = Pick<Consultation, "userId">;
