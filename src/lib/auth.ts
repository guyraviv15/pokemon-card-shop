import { cookies } from 'next/headers'
import fs from 'node:fs'
import path from 'node:path'

const ADMIN_FILE = path.join(process.cwd(), 'src', 'data', 'admin.json')
const SESSION_COOKIE = 'pokemon_admin_session'

function getStoredPassword(): string {
  if (!fs.existsSync(ADMIN_FILE)) {
    return 'admin'
  }
  const raw = fs.readFileSync(ADMIN_FILE, 'utf-8')
  const data = JSON.parse(raw)
  return data.passwordHash || 'admin'
}

export function verifyPassword(password: string): boolean {
  return password === getStoredPassword()
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = Buffer.from(
    JSON.stringify({ authenticated: true, timestamp: Date.now() })
  ).toString('base64')
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session) return false
  try {
    const data = JSON.parse(Buffer.from(session.value, 'base64').toString('utf-8'))
    return data.authenticated === true
  } catch {
    return false
  }
}

export function changePassword(newPassword: string): void {
  const dir = path.dirname(ADMIN_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(ADMIN_FILE, JSON.stringify({ passwordHash: newPassword }, null, 2), 'utf-8')
}
