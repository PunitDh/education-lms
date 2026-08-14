import consultantRepository from "./repository";

const consultationService = {
  fetchAll: async function () {
    return await consultantRepository.all();
  },

  fetchByUserId: async function (userId: string) {
    return await consultantRepository.where({ userId });
  },
};

export default consultationService;
