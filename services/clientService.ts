import api from "./api"

export interface Client {
  id: string
  name: string
  email: string
  created_at: string
  users_count?: number
  agents_count?: number
}

export interface CreateClientRequest {
  name: string
  email: string
  password: string
}

export interface UpdateClientRequest {
  name: string
  email: string
}

export interface ListClientsResponse {
  items: Client[]
  total: number
}

export const createClient = async (client: any) => {
  try {
    const response = await api.post("/api/v1/clients", client)
    return response.data
  } catch (error) {
    throw error
  }
}

export const listClients = (skip = 0, limit = 10) => api.get<Client[]>(`/api/v1/clients/?skip=${skip}&limit=${limit}`)
export const getClient = (clientId: string) => api.get<Client>(`/api/v1/clients/${clientId}`)
export const updateClient = (clientId: string, data: UpdateClientRequest) => api.put<Client>(`/api/v1/clients/${clientId}`, data)
export const deleteClient = async (id: string) => {
  try {
    const response = await api.delete(`/api/v1/clients/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const impersonateClient = async (id: string) => {
  try {
    const response = await api.post(`/api/v1/clients/${id}/impersonate`)
    return response.data
  } catch (error) {
    throw error
  }
} 