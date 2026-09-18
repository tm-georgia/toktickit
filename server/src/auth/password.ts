import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

export function validatePassword(password: string): string | null {
  if (password.length < 12) {
    return "Password must be at least 12 characters.";
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return "Password must include uppercase, lowercase, and numeric characters.";
  }

  return null;
}

function deriveKey(password: string, salt: Buffer, keyLength: number, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, { N: n, r, p }, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await deriveKey(password, salt, KEY_LENGTH, SCRYPT_N, SCRYPT_R, SCRYPT_P);

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  encodedHash: string
): Promise<boolean> {
  const [algorithm, n, r, p, encodedSalt, encodedKey] = encodedHash.split("$");

  if (
    algorithm !== "scrypt" ||
    !encodedSalt ||
    !encodedKey ||
    !Number.isInteger(Number(n)) ||
    !Number.isInteger(Number(r)) ||
    !Number.isInteger(Number(p))
  ) {
    return false;
  }

  try {
    const expectedKey = Buffer.from(encodedKey, "base64url");
    const derivedKey = await deriveKey(
      password,
      Buffer.from(encodedSalt, "base64url"),
      expectedKey.length,
      Number(n),
      Number(r),
      Number(p)
    );

    return expectedKey.length === derivedKey.length && timingSafeEqual(expectedKey, derivedKey);
  } catch {
    return false;
  }
}
