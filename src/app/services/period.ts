import axios from 'axios';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/period`;

const periodService = {
  // Obtener todos los periodos - ACTIVO, CARGANDO y CERRADO , mas no los NO ACTIVO
  getAll: async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/getall`);
      return data;
    } catch (error) {
      console.error('Error al obtener todos los periodos:', error);
      return null;
    }
  },

  // Obtener un periodo por su ID academico
  getById: async (id: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/get/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener el periodo academico con ID ${id}:`, error);
      return null;
    }
  },

  create: async (id: string) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/create`, {
        id,
      });
      return data;
    } catch (error) {
      console.error('Error al crear un periodo:', error);
      return null;
    }
  },

  // Actualizar el estado de un periodo existente
  updateState: async (id: string, estado: string) => {
    try {
      const { data } = await axios.patch(`${BASE_URL}/update-state`, { id, estado });
      return data;
    } catch (error) {
      console.error(`Error al actualizar el periodo con ID ${id}:`, error);
      return null;
    }
  },

  //verifica si hay activos o en carga
  verify: async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/verify-active`);
      return data;
    } catch (error) {
      console.error('Error al obtener todos los periodos:', error);
      return null;
    }
  },
};

export default periodService;
