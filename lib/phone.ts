/**
 * Normalises an Indian mobile number to its 10 digits, accepting forms like
 * "98765 43210", "+91 98765-43210" and "098765 43210". Returns null if invalid.
 */
export function normalizeMobile(input: string) {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/** "+919876543210" → "+91 98765 43210" */
export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : phone;
}
