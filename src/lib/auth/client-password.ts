// ==============================================================================
// KAABIL (काबिल) — Client-Safe Password Strength Evaluator
// Pure TypeScript logic safe for React Client Components without Node.js crypto
// ==============================================================================

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: "Too Weak" | "Weak" | "Fair" | "Strong";
  feedback: string[];
}

export function evaluatePasswordStrengthClient(password: string): PasswordStrengthResult {
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
