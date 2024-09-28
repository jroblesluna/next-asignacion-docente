import axios from 'axios';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/teacher`;

const teacherService = {
  getAll: async () => {
    try {
      const { data } = await axios.get(BASE_URL + '/getall');
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};

export default teacherService;
