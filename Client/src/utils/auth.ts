type JwtClaims = {
  exp?: number
  role?: string
  nameid?: string
  unique_name?: string
  name?: string
  [claim: string]: string | number | undefined
}

export type TokenResponse = {
  accessToken: string
  refreshToken?: string
}

const ROLE_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
const USER_ID_CLAIM =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
const USERNAME_CLAIM =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'

export function parseJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64)

    return JSON.parse(
      decodeURIComponent(
        Array.from(decoded)
          .map((char) => {
            return `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`
          })
          .join(''),
      ),
    ) as JwtClaims
  } catch {
    return null
  }
}

export function saveAuth(data: TokenResponse) {
  const payload = parseJwt(data.accessToken) ?? {}
  const role = payload.role ?? payload[ROLE_CLAIM] ?? 'User'
  const userId = payload.nameid ?? payload[USER_ID_CLAIM] ?? ''
  const username =
    payload[USERNAME_CLAIM] ?? payload.unique_name ?? payload.name ?? ''

  localStorage.setItem('token', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken ?? '')
  localStorage.setItem('role', String(role))
  localStorage.setItem('userId', String(userId))
  localStorage.setItem('username', String(username))
}

export function getRole() {
  return localStorage.getItem('role')
}

export function getToken() {
  return localStorage.getItem('token')
}

export function getUserId() {
  return localStorage.getItem('userId')
}

export function getUsername() {
  return localStorage.getItem('username')
}

export function isTokenExpired(token: string) {
  const claims = parseJwt(token)
  if (!claims?.exp) return true

  return Date.now() >= claims.exp * 1000
}

export function logout() {
  localStorage.clear()
}
