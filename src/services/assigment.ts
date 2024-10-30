import axios from 'axios';

const BASE_URL = '/api/assignment';

const assigmentService = {
  getAll: async (idPeriod: string, idVersion: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/getall`, {
        params: {
          idPeriod,
          idVersion,
        },
      });
      return data;
    } catch (error) {
      console.error('Error al obtener todos los periodos:', error);
      return null;
    }
  },

  getTacAssigment: async (idPeriod: string, idVersion: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/getAssigmentTac`, {
        params: {
          idPeriod,
          idVersion,
        },
      });
      return data;
    } catch (error) {
      console.error('Error al obtener todos los periodos:', error);
      return null;
    }
  },

  getRatiosBalance: async (idPeriod: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/getRatiosBalance`, {
        params: {
          idPeriod,
        },
      });
      return data;
    } catch (error) {
      console.error('Error al obtener todos los periodos:', error);
      return null;
    }
  },

  execute: async (periodo: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/executeScript`, {
        params: {
          periodo,
        },
      });
      return data;
    } catch (error) {
      console.error('Error al ejecutar el script:', error);
      return null;
    }
  },

  getLocation: async (idPeriod: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/getlocation`, {
        params: {
          idPeriod,
        },
      });
      return data;
    } catch (error) {
      console.error('Error al obtener las sedes de los periodos:', error);
      return null;
    }
  },

  getLocationTac: async (idPeriod: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/getlocationTac`, {
        params: {
          idPeriod,
        },
      });
      return data;
    } catch (error) {
      console.error('Error al obtener las sedes de los periodos:', error);
      return null;
    }
  },
  updateRows: async (
    idPeriodo: string,
    idVersion: string,
    uuidFila: string,
    idDocente: string
  ) => {
    try {
      const { data } = await axios.patch(`${BASE_URL}/update-rows`, {
        idPeriodo,
        idVersion,
        uuidFila,
        idDocente,
      });
      return data;
    } catch (error) {
      console.error('Error al actualizar las filas de asignación:', error);
      return null;
    }
  },
};

export default assigmentService;
