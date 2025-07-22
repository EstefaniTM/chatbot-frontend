import axios from 'axios';

const BACKEND_URL = 'https://nestjs-chatbot-backeb-api.desarrollo-software.xyz';
const API_BASE = `${BACKEND_URL}/csv-uploads`;

export const csvService = {
  // Obtener todos los archivos CSV
  getAllCsvFiles: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo archivos CSV:', error);
      throw error;
    }
  },

  // Obtener un archivo CSV específico
  getCsvFile: async (id) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`${API_BASE}/${id}`, {
        headers: { 'X-User-Id': userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo archivo CSV:', error);
      throw error;
    }
  },

  // Crear/subir un nuevo archivo CSV
  uploadCsvFile: async (csvData) => {
    try {
      const response = await axios.post(API_BASE, csvData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error subiendo archivo CSV:', error);
      throw error;
    }
  },

  // Eliminar un archivo CSV específico
  deleteCsvFile: async (id) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.delete(`${API_BASE}/${id}`, {
        headers: { 'X-User-Id': userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error eliminando archivo CSV:', error);
      throw error;
    }
  },

  // Eliminar múltiples archivos CSV
  deleteMultipleCsvFiles: async (ids) => {
    try {
      const response = await axios.delete(API_BASE, {
        data: { ids, userId: localStorage.getItem('userId') }
      });
      return response.data;
    } catch (error) {
      console.error('Error eliminando archivos CSV:', error);
      throw error;
    }
  }
};

export default csvService;
