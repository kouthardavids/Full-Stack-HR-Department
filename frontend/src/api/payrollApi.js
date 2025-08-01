import axios from 'axios';

export const updatePayroll = async (id, updateData) => {
  try {
    const response = await axios.put(`http://localhost:5004/api/payroll/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating payroll:', error);
    throw new Error('Failed to update payroll');
  }
};
