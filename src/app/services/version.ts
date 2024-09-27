import axios from 'axios';

const BASE_URL = '/api/version';

const versionService = {
  getAll: async (id: string) => {
    try {
      const { data } = await axios.get(BASE_URL + `/getall/${id}`);
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  getbyId: async (id: string) => {
    try {
      const { data } = await axios.get(BASE_URL + `/get/${id}`);
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  create: async (id: string, creator: string) => {
    try {
      const { data } = await axios.post(BASE_URL + `/execute`, { id, creator });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};

export default versionService;
