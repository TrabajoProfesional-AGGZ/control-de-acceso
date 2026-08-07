import { fetchTo } from '../utils/utils';

export const getEventosActivos = async () => {
  const response = await fetchTo(`/api/v1/eventos`,"GET");

  if (!response.ok) {
    throw new Error("No se pudieron obtener los eventos");
  }

  return response.json();
};