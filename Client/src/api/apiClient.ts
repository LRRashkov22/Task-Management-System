import { getToken } from '../utils/auth'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

type ApiFetchOptions = RequestInit & {
  auth?: boolean
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { auth = true, headers, ...requestOptions } = options
  const token = getToken()
  const requestHeaders = new Headers(headers)

  if (requestOptions.body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (auth && token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
  })
}

export async function apiJson<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const response = await apiFetch(path, options)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed with ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text.trim()) {
    return undefined as T
  }

  return JSON.parse(text) as T
}
