import "server-only";

import consultationRepository from "./repository";
import { Consultation, ConsultationStatus } from "./types";
import { CurrentUser } from "@/lib/auth/types";
import { isAdmin } from "@/lib/auth/mapper";
import { CreateConsultationDto, EditConsultationDto } from "./contracts";
import {
  ConsultationConflictError,
  ConsultationNotFoundError,
} from "@/lib/auth/authenticate";

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

    if (!existing) throw notFoundError();

    if (existing.status !== ConsultationStatus.SCHEDULED)
      throw new ConsultationConflictError(
        `Cannot edit a ${existing.status} consultation`,
      );

    const updated = await consultationRepository.update(
      userId,
      id,
      consultation,
    );

    if (!updated) throw notFoundError();

    return updated;
  },

  changeStatus: async function (
    userId: string,
    id: string,
    status: ConsultationStatus,
  ): Promise<Consultation> {
    const existing = await consultationRepository.findByIdForUser(userId, id);

    if (!existing) throw notFoundError();

    if (!allowedStatusTransitions[existing.status].includes(status))
      throw new ConsultationConflictError(
        `Cannot change consultation from ${existing.status} to ${status}`,
      );

    const updated = await consultationRepository.changeStatus(
      userId,
      id,
      status,
    );

    if (!updated) throw notFoundError();
    return updated;
  },
};

function notFoundError() {
  return new ConsultationNotFoundError("Consultation not found");
}

export default consultationService;
