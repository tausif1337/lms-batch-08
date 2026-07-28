// ---------------------------------------------------------------------------
// One place for every call to the Django backend.
//
// Everything here uses the browser's built-in fetch(). No extra library.
// ---------------------------------------------------------------------------

// Read the backend address from .env (VITE_API_BASE_URL).
// The fallback is used if the .env file is missing.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// These four endpoints must NEVER receive an Authorization header.
// Django checks the token BEFORE it checks "is this endpoint public?", so an
// old expired token sitting in localStorage would make login itself fail
// with 401 and the user could never log back in.
const PUBLIC_PATHS = [
  '/login/',
  '/register/',
  '/password-reset/',
  '/password-reset-confirm/',
]

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------
// We keep the token in localStorage so it survives a page refresh.
// Note: localStorage is readable by any JavaScript on the page. That is fine
// for a learning project, but a real app should use an httpOnly cookie.

export function getAccessToken() {
  return localStorage.getItem('access')
}

export function saveSession(loginResponse) {
  // The backend nests the tokens: { tokens: { access, refresh } }
  // It is NOT the flat { access, refresh } shape most tutorials show.
  localStorage.setItem('access', loginResponse.tokens.access)
  localStorage.setItem('refresh', loginResponse.tokens.refresh)
  localStorage.setItem(
    'user',
    JSON.stringify({
      user_id: loginResponse.user_id,
      username: loginResponse.username,
    }),
  )
}

export function loadUser() {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('user')
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

// A normal Error, plus the HTTP status and the JSON body Django sent back.
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }

  // Django returns field errors like { "email": ["Enter a valid email address."] }.
  // This turns that into one readable sentence for a red banner.
  get text() {
    const d = this.data
    if (!d) return this.message
    if (typeof d === 'string') return d
    if (d.detail) return d.detail
    if (d.error) return d.error

    const parts = []
    for (const [field, value] of Object.entries(d)) {
      const msg = Array.isArray(value) ? value.join(' ') : String(value)
      parts.push(field === 'non_field_errors' ? msg : `${field}: ${msg}`)
    }
    return parts.length ? parts.join(' | ') : this.message
  }

  // Same data, but keyed by field name, so a form can show the message
  // underneath the input it belongs to.
  get fieldErrors() {
    const d = this.data
    if (!d || typeof d !== 'object') return {}
    const out = {}
    for (const [field, value] of Object.entries(d)) {
      out[field] = Array.isArray(value) ? value.join(' ') : String(value)
    }
    return out
  }
}

// ---------------------------------------------------------------------------
// The one function that actually talks to the server
// ---------------------------------------------------------------------------

async function request(path, { method = 'GET', body } = {}) {
  const isPublic = PUBLIC_PATHS.includes(path)
  const token = getAccessToken()

  const headers = { 'Content-Type': 'application/json' }
  if (token && !isPublic) {
    // The word "Bearer" is required. "JWT" or "Token" is ignored by Django
    // and you get a 401 that does not explain why.
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    // fetch() only rejects when the network itself failed.
    throw new ApiError(
      'Cannot reach the server. Is Django running on port 8000?',
      0,
      null,
    )
  }

  // DELETE returns 204 with an empty body, so there is nothing to parse.
  if (response.status === 204) return null

  // Django's debug error pages are HTML, not JSON. Parsing must not crash.
  let data = null
  const raw = await response.text()
  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !isPublic) {
      // The token expired or is invalid. There is no refresh endpoint on this
      // backend, so the only thing to do is log out and start over.
      clearSession()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login?expired=1')
      }
    }
    throw new ApiError(`Request failed (${response.status})`, response.status, data)
  }

  return data
}

// Short helpers so pages read nicely.
export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}

// ---------------------------------------------------------------------------
// Auth calls
// ---------------------------------------------------------------------------

export const auth = {
  // Remember: the backend logs you in with PHONE, not username and not email.
  login: (phone, password) => api.post('/login/', { phone, password }),
  register: (payload) => api.post('/register/', payload),
  profile: () => api.get('/profile/'),
}

// ---------------------------------------------------------------------------
// The eight LMS resources
// ---------------------------------------------------------------------------
// Every one of them has the exact same five operations, so we build them with
// one small helper instead of writing the same five lines eight times.
//
// Two things to remember about these endpoints:
//   1. There is no pagination, so list() returns a plain array.
//   2. Foreign keys are plain numbers. A course sends { teacher: 3 }, not
//      { teacher: { id: 3, name: "..." } }.

function resource(path) {
  return {
    list: () => api.get(path),
    get: (id) => api.get(`${path}${id}/`),
    create: (data) => api.post(path, data),
    update: (id, data) => api.put(`${path}${id}/`, data),
    remove: (id) => api.del(`${path}${id}/`),
  }
}

export const teachers = resource('/teacher/')
export const students = resource('/student/')
export const courses = resource('/course/')
export const enrollments = resource('/enrollment/')
export const lessons = resource('/lesson/')
export const assignments = resource('/assignment/')
export const submissions = resource('/submission/')
export const results = resource('/results/')
