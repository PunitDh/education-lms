import consultantRepository from "./repository";

const consultationService = {
  fetchAll: async function () {
    return await consultantRepository.all();
  },

  fetchByUserId: async function (userId: string) {
    return await consultantRepository.all();
  },
};

export default consultationService;
