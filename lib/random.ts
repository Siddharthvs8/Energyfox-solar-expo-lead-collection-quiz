import { randomBytes, randomInt } from "node:crypto";

export function randomToken() {
  return randomBytes(24).toString("base64url");
}

/** Short human-friendly code without look-alike characters (0/O, 1/I/L). */
export function randomCode(length: number, alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789") {
  let code = "";
  for (let i = 0; i < length; i++) code += alphabet[randomInt(alphabet.length)];
  return code;
}
