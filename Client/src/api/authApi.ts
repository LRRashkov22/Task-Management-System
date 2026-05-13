import { apiFetch } from './apiClient'

export type LoginRequest = {
  username: string
  password: string
}

export async function loginApi({ username, password }: LoginRequest) {
  return apiFetch('/identity/login', {
    auth: false,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}
