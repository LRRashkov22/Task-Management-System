const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7047/api'

export type LoginRequest = {
  username: string
  password: string
}

export async function loginApi({ username, password }: LoginRequest) {
  return fetch(`${API_BASE_URL}/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}
