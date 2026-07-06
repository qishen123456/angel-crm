import axios from 'axios'
import { i18n } from '../locales'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  config.headers = config.headers || {}
  config.headers['Accept-Language'] = i18n.language
  const token = localStorage.getItem('angelcrm_auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('angelcrm_auth_token')
      localStorage.removeItem('angelcrm_auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  get: apiClient.get,
  post: apiClient.post,
  put: apiClient.put,
  patch: apiClient.patch,
  delete: apiClient.delete,
}
