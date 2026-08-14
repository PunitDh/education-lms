import "server-only";

import consultantRepository from "./repository";
import { CreateConsultationDto, EditConsultationDto } from "./types";
import { JwtPayload } from "@supabase/supabase-js";

const consultationService = {
  fetchAll: async function () {
    return await consultantRepository.all();
  },

  fetchByUserId: async function (userId: string) {
    return await consultantRepository.where({ userId });
  },

  fetchForUser: async function (user: JwtPayload) {
    return user.app_metadata?.role === "admin"
      ? await this.fetchAll()
      : await this.fetchByUserId(user.sub);
  },

  create: async function (consultation: CreateConsultationDto) {
    return await consultantRepository.create(consultation);
  },

  update: async function (id: string, consultation: EditConsultationDto) {
    return {};
  },

  cancel: async function (id: string) {
    return {};
  },
};

export default consultationService;
