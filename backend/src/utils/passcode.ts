const SALT_LENGTH = 16;
// Cloudflare Workers currently limit PBKDF2 iterations to <=100,000.
const ITERATIONS = 100_000;
const KEY_LENGTH = 32 * 8; // bits
const DIGEST = 'SHA-256';

const encoder = new TextEncoder();

function toBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(passcode: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passcode),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    KEY_LENGTH
  );
}

export async function hashPasscode(passcode: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const derived = await deriveKey(passcode, salt);
  const hash = new Uint8Array(derived);
  return `${ITERATIONS}.${toBase64(salt)}.${toBase64(hash)}`;
}

export async function verifyPasscode(passcode: string, stored: string): Promise<boolean> {
  if (!stored) {
    return false;
  }

  const [iterationPart, saltPart, hashPart] = stored.split('.');
  if (!iterationPart || !saltPart || !hashPart) {
    return false;
  }

  const iterations = Number.parseInt(iterationPart, 10);
  if (!Number.isInteger(iterations) || iterations <= 0) {
    return false;
  }

  const salt = fromBase64(saltPart);
  const expected = fromBase64(hashPart);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passcode),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: DIGEST,
    },
    keyMaterial,
    expected.byteLength * 8
  );

  const actual = new Uint8Array(derived);
  if (actual.byteLength !== expected.byteLength) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < actual.byteLength; i += 1) {
    diff |= actual[i] ^ expected[i];
  }

  return diff === 0;
}
