import axios from 'axios';

const BASE_URL = '/api/event';

const eventService = {
  getAll: async (id: string) => {
    try {
      const { data } = await axios.get(BASE_URL + `/getall/${id}`, {
        timeout: 0, // Sin límite de tiempo
      });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  execute: async (id: string) => {
    try {
      const { data } = await axios.patch(
        BASE_URL + `/execute`,
        { id },
        {
          timeout: 0, // Sin límite de tiempo
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};

export default eventService;
