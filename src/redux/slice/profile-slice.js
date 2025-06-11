import axiosInstance from "../../api/api";

export const getProfiles = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axiosInstance.get(`/api/profiles/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Ошибка при получении профилей:', error);
      return { success: false, error: error.response?.data };
    }
};

export const getProfile = async (id) => {
  const token = localStorage.getItem('accessToken');
  try {
    const response = await axiosInstance.get(`/api/profiles/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    return { success: false, error: error.response?.data };
  }
};

export const editProfile = async (id, newAvatar, description) => {
  try {
    const response = await axiosInstance.patch(`/api/groups/${id}/`, 
      { 
        avatar: newAvatar,
        description: description
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Ошибка при обновлении профиля', error);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};