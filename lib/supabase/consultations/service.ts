import "server-only";

import consultantRepository from "./repository";
import {
  Consultation,
  ConsultationStatus,
  CreateConsultationDto,
  EditConsultationDto,
} from "./types";
import { JwtPayload } from "@supabase/supabase-js";

const consultationService = {
  fetchAll: async function (): Promise<Consultation[]> {
    return await consultantRepository.all();
  },

  fetchByUserId: async function (userId: string): Promise<Consultation[]> {
    return await consultantRepository.where({ userId });
  },

  fetchForUser: async function (user: JwtPayload): Promise<Consultation[]> {
    return user.app_metadata?.role === "admin"
      ? await this.fetchAll()
      : await this.fetchByUserId(user.sub);
  },

  create: async function (
    userId: string,
    consultation: CreateConsultationDto,
  ): Promise<Consultation> {
    return await consultantRepository.create(userId, consultation);
  },

  update: async function (
    userId: string,
    id: string,
    consultation: EditConsultationDto,
  ): Promise<Consultation> {
    return await consultantRepository.update(userId, id, consultation);
  },

  changeStatus: async function (
    userId: string,
    id: string,
    status: ConsultationStatus,
  ): Promise<Consultation> {
    return await consultantRepository.changeStatus(userId, id, status);
  },
};

export default consultationService;
