import axios from 'axios'
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://sricu-uls-api.onrender.com/api', timeout: 60000, headers: { Accept: 'application/json' } })
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('sricu-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use(r => r, error => {
  if (error.response?.status === 401 && sessionStorage.getItem('sricu-token')) {
    sessionStorage.removeItem('sricu-token')
    window.dispatchEvent(new Event('sricu-session-expired'))
  }
  return Promise.reject(error)
})
export const unwrap = data => data?.data ?? data
export function errorMessage(error) {
  if (!error.response) return 'No se pudo conectar con el servidor. Compruebe su conexión e intente de nuevo. El servicio puede tardar en iniciar.'
  if (error.response.status === 403) return error.response.data?.message || 'Su cuenta no tiene permiso para esta operación.'
  if (error.response.status === 404) return 'El registro no existe o no está disponible para su cuenta.'
  return error.response.data?.message || 'No se pudo completar la operación. Intente de nuevo.'
}
export const fieldErrors = error => Object.fromEntries(Object.entries(error.response?.data?.errors || {}).map(([k,v]) => [k, Array.isArray(v) ? v.join(' ') : v]))
export async function downloadFile(resourceId, file) {
  const { data } = await api.get(`/resources/${resourceId}/files/${file.id}/download`, { responseType: 'blob' })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a'); a.href = url; a.download = file.original_name || file.name || 'recurso'; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
