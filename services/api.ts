import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token do cookie no header Authorization
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Browser: lê o token do cookie
    const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/)
    const token = match ? decodeURIComponent(match[1]) : null
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

export default api;