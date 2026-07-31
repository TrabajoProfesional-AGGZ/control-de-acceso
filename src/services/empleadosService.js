import { fetchTo, fetchWithOutAuth } from '../utils/utils';

export async function validarEmpleado(legajo, mail, dni) {
  const res = await fetchWithOutAuth('/api/v1/empleados/validar', 'POST', { legajo, mail, dni });
  if (res.status === 404) throw new Error('empleado-no-encontrado');
  if (res.status === 409) throw new Error('cuenta-ya-registrada');
  if (!res.ok) throw new Error('Error al validar el empleado');
  return res.json();
}

export async function reclamarCuentaEmpleado(legajo) {
  const res = await fetchTo(`/api/v1/empleados/por-legajo/${encodeURIComponent(legajo)}/reclamar`, 'POST');
  if (res.status === 409) throw new Error('cuenta-ya-registrada');
  if (res.status === 404) throw new Error('empleado-no-encontrado');
  if (!res.ok) throw new Error('Error al reclamar la cuenta del empleado');
  return res.json();
}

export async function obtenerMailPorLegajo(legajo) {
  const res = await fetchWithOutAuth(`/api/v1/empleados/mail-por-legajo/${encodeURIComponent(legajo)}`, 'GET');
  if (res.status === 404) throw new Error('empleado-no-encontrado');
  if (!res.ok) throw new Error('Error al buscar el empleado');
  const { mail } = await res.json();
  return mail;
}
