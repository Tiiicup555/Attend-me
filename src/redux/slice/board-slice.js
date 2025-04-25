import axiosInstance from "../../api/api";


export const getBoardDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/boards/${id}/`);
    return { success: true, data: response.data };  
  } catch (error) {
    console.error("Ошибка при получении данных о борде:", error.response?.data || error);
    return { success: false, error: error.response?.data || error.message }; 
  }
};

export const createBoard = async (boardData) => {
    try {
      const response = await axiosInstance.post('/api/boards/', boardData); 
      return { success: true, data: response.data };  
    } catch (error) {
      console.error("Ошибка при создании борда:", error.response?.data || error);
      return { success: false, error: error.response?.data || error.message }; 
    }
};

export const deleteBoard = async (id) => {
    try {
      await axiosInstance.delete(`/api/boards/${id}/`); 
      return { success: true };  
    } catch (error) {
      console.error('Ошибка при удалении борда:', error);
      return {
        success: false,
        error: error.response?.data || error.message, 
      };
    }
  };