import axios from "axios";
import { axiosInstance } from "../../api/api";

export const getGroups = async () => {
    try {
      const response = await axiosInstance.get('/api/groups/');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Ошибка при получении групп:', error);
      return { success: false, error: error.response?.data };
    }
};


export const getGroupDetail = async (id) => {
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.get(`/api/groups/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Ошибка при получении деталей класса:", error.response?.data || error);
      return { success: false };
    }
  };


export const createGroup = async (data) => {
    try {
      const response = await axiosInstance.post("/api/groups/", data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error };
    }
};

