import "server-only";

import consultationRepository from "./repository";
import { Consultation, ConsultationStatus } from "./types";
import { CurrentUser } from "@/lib/auth/types";
import { isAdmin } from "@/lib/auth/mapper";
import { CreateConsultationDto, EditConsultationDto } from "./contracts";

const allowedStatusTransitions: Readonly<
  Record<ConsultationStatus, ConsultationStatus[]>
> = {
  [ConsultationStatus.SCHEDULED]: [
    ConsultationStatus.COMPLETED,
    ConsultationStatus.CANCELLED,
  ],
  [ConsultationStatus.COMPLETED]: [ConsultationStatus.SCHEDULED],
  [ConsultationStatus.CANCELLED]: [],
};

const consultationService = {
  fetchAll: async function (): Promise<Consultation[]> {
    return await consultationRepository.all();
  },

  fetchByUserId: async function (userId: string): Promise<Consultation[]> {
    return await consultationRepository.where({ userId });
  },

  fetchForUser: async function (user: CurrentUser): Promise<Consultation[]> {
    return isAdmin(user)
      ? await this.fetchAll()
      : await this.fetchByUserId(user.id);
  },

  create: async function (
    userId: string,
    consultation: CreateConsultationDto,
  ): Promise<Consultation> {
    return await consultationRepository.create(userId, consultation);
  },

  update: async function (
    userId: string,
    id: string,
    consultation: EditConsultationDto,
  ): Promise<Consultation> {
    const existing = await consultationRepository.findByIdForUser(userId, id);

    if (existing.status !== ConsultationStatus.SCHEDULED)
      throw new Error(`Cannot edit a ${existing.status} consultation`);

    return await consultationRepository.update(userId, id, consultation);
  },

  changeStatus: async function (
    userId: string,
    id: string,
    status: ConsultationStatus,
  ): Promise<Consultation> {
    const existing = await consultationRepository.findByIdForUser(userId, id);

    if (allowedStatusTransitions[existing.status].includes(status))
      return await consultationRepository.changeStatus(userId, id, status);

    throw new Error(
      `Cannot change consultation from ${existing.status} to ${status}`,
    );
  },
};

export default consultationService;
