import { apiFetch, apiJson } from './apiClient'
import type { TokenResponse } from '../utils/auth'

export type LoginRequest = {
  username: string
  password: string
}

export type ChangePasswordRequest = {
  password: string
  newPassword: string
}

type TokenResponseApiDto = {
  accessToken?: string
  AccessToken?: string
  refreshToken?: string
  RefreshToken?: string
}

export function mapTokenResponse(dto: TokenResponseApiDto): TokenResponse {
  return {
    accessToken: dto.accessToken ?? dto.AccessToken ?? '',
    refreshToken: dto.refreshToken ?? dto.RefreshToken,
  }
}

export async function loginApi({ username, password }: LoginRequest) {
  return apiFetch('/identity/login', {
    auth: false,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}

export async function logoutApi() {
  return apiFetch('/identity/logout', {
    method: 'POST',
  })
}

export async function changePasswordApi(request: ChangePasswordRequest) {
  const data = await apiJson<TokenResponseApiDto>('/identity/change-password', {
    method: 'POST',
    body: JSON.stringify({
      password: request.password,
      newPassword: request.newPassword,
    }),
  })

  return mapTokenResponse(data)
}
