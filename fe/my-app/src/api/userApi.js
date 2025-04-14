export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/api/admin/delete-user/${userId}`);
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
    throw new Error(response.data?.message || 'Failed to delete user');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}; 