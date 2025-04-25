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

export const updateAttendanceStatus = async (attendanceId, newStatus) => {
    try {
      const response = await axiosInstance.patch(`/api/attendances/${attendanceId}/`, {
        status: newStatus, 
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Ошибка при обновлении статуса посещаемости:', error);
      return { success: false, error: error.response?.data };
    }
  };
  
  
  