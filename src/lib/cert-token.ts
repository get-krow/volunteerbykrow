import { CertificateRecord } from './types';

const SECRET_SALT = 'KROW_VERIFICATION_SECURE_SALT_2026';

function computeSignature(payloadStr: string): string {
  const combined = `${payloadStr}|${SECRET_SALT}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase();
}

export interface CertDataPayload {
  certId: string;
  krowId: string;
  name: string;
  hours: number;
  opps: number;
  issued: string;
}

export function encodeCertificateToken(data: CertDataPayload): string {
  const rawPayload = `${data.certId.toUpperCase()}|${data.krowId.toUpperCase()}|${data.name}|${data.hours}|${data.opps}|${data.issued}`;
  const sig = computeSignature(rawPayload);

  const obj = {
    c: data.certId.toUpperCase(),
    k: data.krowId.toUpperCase(),
    n: data.name,
    h: data.hours,
    o: data.opps,
    i: data.issued,
    s: sig,
  };

  try {
    const json = JSON.stringify(obj);
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return window.btoa(encodeURIComponent(json));
    }
    return Buffer.from(encodeURIComponent(json)).toString('base64');
  } catch (e) {
    return '';
  }
}

export function decodeCertificateToken(token: string): CertificateRecord | null {
  if (!token) return null;
  try {
    let json = '';
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      json = decodeURIComponent(window.atob(token));
    } else {
      json = decodeURIComponent(Buffer.from(token, 'base64').toString('utf8'));
    }

    const obj = JSON.parse(json);
    if (!obj || !obj.c || !obj.k || !obj.n || !obj.s) return null;

    const rawPayload = `${obj.c.toUpperCase()}|${obj.k.toUpperCase()}|${obj.n}|${obj.h}|${obj.o}|${obj.i}`;
    const expectedSig = computeSignature(rawPayload);

    if (obj.s !== expectedSig) {
      console.warn('Certificate token signature verification failed');
      return null;
    }

    return {
      id: `cert-${obj.c}`,
      certificate_id: obj.c,
      user_id: `user-${obj.k}`,
      krow_id: obj.k,
      student_name: obj.n,
      hours: Number(obj.h) || 0,
      activity_count: Number(obj.o) || 0,
      issued_at: obj.i || new Date().toISOString(),
      status: 'VALID',
      created_at: obj.i || new Date().toISOString(),
    };
  } catch (e) {
    console.error('Failed to decode certificate token:', e);
    return null;
  }
}
