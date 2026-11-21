// ==============================================================================
// KAABIL (काबिल) — Cryptographic Password Hashing & Strength Evaluator
// Uses Node.js native crypto scrypt (NIST SP 800-132 memory-hard key derivation)
// Zero binary native compilation dependencies (100% Windows WDAC compliant)
// ==============================================================================

import crypto from "crypto";

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const SCRYPT_OPTIONS: crypto.ScryptOptions = {
  N: 16384, // CPU/memory cost
  r: 8,     // Block size
  p: 1,     // Parallelization
};

/**
 * Hashes a plain-text password using native scrypt with a unique cryptographically random salt.
 * Returns format: "scrypt:<hex-salt>:<hex-key>"
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
    crypto.scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Verifies a plain-text password against a stored scrypt hash using timing-safe comparison.
 * Never leaks timing information regardless of whether the password matches.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!storedHash || !storedHash.startsWith("scrypt:")) {
      return resolve(false);
    }

    const parts = storedHash.split(":");
    if (parts.length !== 3) {
      return resolve(false);
    }

    const [, salt, originalKeyHex] = parts;
    const originalKey = Buffer.from(originalKeyHex, "hex");

    crypto.scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        if (derivedKey.length !== originalKey.length) return resolve(false);
        const match = crypto.timingSafeEqual(derivedKey, originalKey);
        resolve(match);
      } catch {
        resolve(false);
      }
    });
  });
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: "Too Weak" | "Weak" | "Fair" | "Strong";
  feedback: string[];
}

/**
 * Evaluates password strength and returns constructive feedback.
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, label: "Too Weak", feedback: ["Password is required."] };
  }

  if (password.length >= 8) score += 1;
  else feedback.push("Must be at least 8 characters long.");

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  else feedback.push("Include both uppercase and lowercase letters.");

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push("Include at least one numerical digit.");

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push("Include at least one special symbol (@, #, $, %, etc.).");

  let label: PasswordStrengthResult["label"] = "Too Weak";
  if (score === 2) label = "Weak";
  else if (score === 3) label = "Fair";
  else if (score >= 4) label = "Strong";

  return { score, label, feedback };
}
