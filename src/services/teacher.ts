import axios from 'axios';

const BASE_URL = '/api/teacher';

const teacherService = {
  getAll: async (idPeriod: string) => {
    try {
      const { data } = await axios.get(BASE_URL + `/getall`, {
        params: {
          idPeriod,
        },
      });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  getDisponibility: async (idPeriod: string, uuidSlot: string, version: string) => {
    try {
      const { data } = await axios.get(BASE_URL + `/disponibility`, {
        params: {
          idPeriod,
          uuidSlot,
          version,
        },
      });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  //
  getEventDisponibility: async (periodo: string) => {
    try {
      const { data } = await axios.get(BASE_URL + `/getEventDisponibility`, {
        params: {
          periodo,
        },
      });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  getSedeTeacher: async (correo: string) => {
    try {
      const { data } = await axios.get(BASE_URL + `/getSede`, {
        params: {
          correo,
        },
      });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  getCompatibility: async (idPeriod: string, uuidSlot: string, version: string) => {
    try {
      const { data } = await axios.get(BASE_URL + `/compability`, {
        params: {
          idPeriod,
          uuidSlot,
          version,
        },
      });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};

export default teacherService;
