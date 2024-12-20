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

  getDataBalance: async (idPeriod: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/getbalanceData`, {
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

  execute: async (periodo: string, correo: string, addEvents: string, tipo: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/executeScript`, {
        params: {
          periodo,
          correo,
          addEvents,
          tipo,
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

  getData: async () => {
    try {
      const { data } = await axios.get(`/api/getData`, {});
      return data;
    } catch (error) {
      console.error('Error al obtener los datos del tenat', error);
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

  getEscenarios: async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/getEscenarios`);
      return data;
    } catch (error) {
      console.error('Error al obtener los escenarios:', error);
      return null;
    }
  },

  updateRows: async (
    idPeriodo: string,
    idVersion: string,
    uuidFila: string,
    idDocente: string,
    userName: string
  ) => {
    try {
      const { data } = await axios.patch(`${BASE_URL}/update-rows`, {
        idPeriodo,
        idVersion,
        uuidFila,
        idDocente,
        userName,
      });

      if (!data.data) {
        alert(data.message);
      }

      return data;
    } catch (error) {
      console.error('Error al actualizar las filas de asignación:', error);
      return null;
    }
  },

  updateEscenario: async (escenario: string) => {
    try {
      const { data } = await axios.patch(`${BASE_URL}/updateEscenario`, {
        escenario,
      });

      if (!data.data) {
        alert(data.message);
      }

      return data;
    } catch (error) {
      console.error('Error al actualizar las filas de asignación:', error);
      return null;
    }
  },
  updateRoomRows: async (
    idPeriodo: string,
    idVersion: string,
    uuidFila: string,
    idRoom: string,
    userName: string
  ) => {
    try {
      const { data } = await axios.patch(`${BASE_URL}/updateRoom-rows`, {
        idPeriodo,
        idVersion,
        uuidFila,
        idRoom,
        userName,
      });

      if (!data.data) {
        alert(data.message);
      }

      return data;
    } catch (error) {
      console.error('Error al actualizar las filas de asignación:', error);
      return null;
    }
  },

  sincronizarTablaOutput: async (idPeriodo: string, correo: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/sincTablaOutput`, {
        params: {
          idPeriodo,
          correo,
        },
      });

      if (!data.data) {
        alert(data.message);
      }

      return data;
    } catch (error) {
      console.error('Error al actualizar las filas de asignación:', error);
      return null;
    }
  },

  getRoomAvailable: async (idPeriod: string, uuidSlot: string, version: string) => {
    try {
      const { data } = await axios.get(BASE_URL + `/getRoomAvailable`, {
        params: {
          idPeriod,
          uuidSlot,
          version,
        },
      });
      return data;
    } catch (error) {
      console.log("Error", error)
      return null;
    }
  },
};

export default assigmentService;
