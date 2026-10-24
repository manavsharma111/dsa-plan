// Packs 258 question states into exactly 33 bytes (44 chars URL-safe base64)
export function encodeState(state) {
  const b = new Uint8Array(33);
  for (let i = 1; i <= 258; i++) {
    if (state['c' + i]) {
      b[Math.floor((i - 1) / 8)] |= (1 << ((i - 1) % 8));
    }
  }
  let s = '';
  for (let j = 0; j < b.length; j++) s += String.fromCharCode(b[j]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeState(str) {
  if (!str || typeof str !== 'string') return {};
  try {
    let clean = str.replace(/-/g, '+').replace(/_/g, '/');
    while (clean.length % 4) clean += '=';
    const bin = atob(clean);
    const b = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    const res = {};
    for (let k = 1; k <= 258; k++) {
      const bi = Math.floor((k - 1) / 8);
      const bit = (k - 1) % 8;
      if (bi < b.length && (b[bi] & (1 << bit)) !== 0) {
        res['c' + k] = true;
      }
    }
    return res;
  } catch (e) {
    console.error('State decode error:', e);
    return {};
  }
}

export function sanitizeKey(k) {
  return (k || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}
