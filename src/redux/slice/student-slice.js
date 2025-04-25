import axiosInstance from "../../api/api";

export const getStudents = async () => {
    try {
      const response = await axiosInstance.get('/api/students/');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Ошибка при получении данных о посещаемости:', error);
      return { success: false, error: error.response?.data };
    }
};


export const getTeachers = async () => {
    try {
      const response = await axiosInstance.get('/api/teachers/');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Ошибка при получении данных о посещаемости:', error);
      return { success: false, error: error.response?.data };
    }
};