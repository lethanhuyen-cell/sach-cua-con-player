import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getAdminSessionVersion } from './repository';

export const ADMIN_COOKIE_NAME = 'litibook_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

// Rate limiting: 5 failed attempts -> 15 minute temporary lock (ADM-001, AC-07)
interface AttemptRecord {
  count: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, AttemptRecord>();

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'litibook-family-default-secret-2026';
}

export function getConfiguredAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'goc-cay-soi-2026';
}

export function checkLoginRateLimit(ipKey: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const rec = loginAttempts.get(ipKey);
  if (!rec) return { allowed: true, retryAfterSeconds: 0 };
  if (rec.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((rec.lockedUntil - now) / 1000)
    };
  }
  if (rec.lockedUntil !== 0 && rec.lockedUntil <= now) {
    loginAttempts.delete(ipKey);
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordLoginFailure(ipKey: string): { locked: boolean; remainingAttempts: number } {
  const now = Date.now();
  const rec = loginAttempts.get(ipKey) || { count: 0, lockedUntil: 0 };
  rec.count += 1;
  if (rec.count >= 5) {
    rec.lockedUntil = now + 15 * 60 * 1000; // 15 minutes
    loginAttempts.set(ipKey, rec);
    return { locked: true, remainingAttempts: 0 };
  }
  loginAttempts.set(ipKey, rec);
  return { locked: false, remainingAttempts: Math.max(0, 5 - rec.count) };
}

export function clearLoginFailures(ipKey: string): void {
  loginAttempts.delete(ipKey);
}

export function createAdminToken(sessionVersion: number): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${sessionVersion}:${exp}`;
  const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [role, verStr, expStr, sig] = decoded.split(':');
    if (role !== 'admin' || !verStr || !expStr || !sig) return false;
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return false;

    const payload = `${role}:${verStr}:${expStr}`;
    const expectedSig = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return false;
    }

    const currentVersion = await getAdminSessionVersion();
    return Number(verStr) === currentVersion;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}
