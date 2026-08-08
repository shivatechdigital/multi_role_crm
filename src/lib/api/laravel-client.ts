import axios, { AxiosInstance } from 'axios'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'https://shivatechdigital.com'
const LARAVEL_API_TOKEN = process.env.LARAVEL_API_TOKEN || ''

class LaravelClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${LARAVEL_API_URL}/api/adminseo`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Token': LARAVEL_API_TOKEN,
      },
    })

    // ✅ Response interceptor — extra characters strip karo
    this.client.interceptors.response.use(
      (response) => {
        if (typeof response.data === 'string') {
          const cleaned = response.data.replace(/^[^{[]+/, '').trim()
          try {
            response.data = JSON.parse(cleaned)
          } catch {
            response.data = cleaned
          }
        }
        return response
      },
      (error) => {
        console.error('Laravel API Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  get instance() {
    return this.client
  }
}

export const laravelClient = new LaravelClient().instance
