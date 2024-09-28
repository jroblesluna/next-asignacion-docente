import axios from 'axios';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/event`;

const eventService = {
  getAll: async (id: string) => {
    try {
      const { data } = await axios.get(BASE_URL + `/getall/${id}`);
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  execute: async (id: string) => {
    try {
      const { data } = await axios.patch(BASE_URL + `/execute`, { id });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};

export default eventService;
