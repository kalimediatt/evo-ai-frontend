import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the token from the cookie to the Authorization header
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Browser: reads the token from the cookie
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