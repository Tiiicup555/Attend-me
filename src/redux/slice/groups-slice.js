import { axiosInstance } from "../../api/api";

export const getGroups = async () => {
  const token = localStorage.getItem('accessToken');
  try {
    const response = await axiosInstance.get('/api/groups/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Ошибка при получении групп:', error);
    return { success: false, error: error.response?.data };
  }
};

export const createGroup = async ({ name, teacher }) => {
  try {
    const response = await axiosInstance.post("/api/groups/", {
      name,
      teacher,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

export const editGroup = async (id, newName) => {
  try {
    const response = await axiosInstance.patch(`/api/groups/${id}/`, 
      { name: newName }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Ошибка при обновлении группы:', error);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

export const deleteGroup = async (id) => {
  try {
    await axiosInstance.delete(`/api/groups/${id}/`, {
    });
    return { success: true };
  } catch (error) {
    console.error('Ошибка при удалении группы:', error);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};



