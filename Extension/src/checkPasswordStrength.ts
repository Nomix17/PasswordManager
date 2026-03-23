export function checkPasswordStrength(password: string): { success: boolean; message: string } {
  const MIN_LENGTH = 12;

  if (password.length < MIN_LENGTH) {
    return {
      success: false,
      message: `password should be at least ${MIN_LENGTH} characters`
    };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  const missing: string[] = [];
  if (!hasLower) missing.push("lowercase letter");
  if (!hasUpper) missing.push("uppercase letter");
  if (!hasDigit) missing.push("number");

  if (missing.length > 0) {
    return {
      success: false,
      message: `password must include at least: ${missing.join(", ")}`
    };
  }

  return { success: true, message: "" };
}
