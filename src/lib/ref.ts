import { CommonRef } from '../types/common';

export function encodeRef(ref: CommonRef): string {
  const parts = [ref.type, ref.id];
  if (ref.version) parts.push(ref.version);
  return btoa(parts.join(':')).replace(/=/g, '');
}

export function decodeRef(encoded: string): CommonRef {
  try {
    const decoded = atob(encoded);
    const [type, id, version] = decoded.split(':');
    return { id, type: type as any, version };
  } catch (e) {
    throw new Error('Invalid CommonRef format');
  }
}
