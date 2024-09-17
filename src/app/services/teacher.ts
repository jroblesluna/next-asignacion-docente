import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const teacherService = {
  getAll: async () => {
    try {
      const { data } = await axios.get(BASE_URL + '/api/teacher/getall');
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};

export default teacherService;
