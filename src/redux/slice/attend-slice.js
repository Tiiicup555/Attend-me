import axiosInstance from "../../api/api";

export const getAttendances = async () => {
    try {
      const response = await axiosInstance.get('/api/attendances/');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Ошибка при получении данных о посещаемости:', error);
      return { success: false, error: error.response?.data };
    }
};

export const updateAttendanceStatus = async (id, status, student, board, date) => {
  try {
    const response = await axiosInstance.put(`/api/attendances/${id}/`, {
      student,
      board,
      status,
      date,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Ошибка обновления посещаемости:", error.response?.data || error.message);
    return { success: false };
  }
};

  
  
  