// auth/Encoder.tsx

// i need to encode and decode the user messages with their token as the key using the crypto module
import crypto from "crypto";
const algorithm = "aes-256-cbc";
const iv = crypto.randomBytes(16);

export function encodeMessage(message: string, userId: string): string {
  const key = crypto.scryptSync(userId, "salt", 32);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}
export function decodeMessage(encodedMessage: string, userId: string): string {
  const [ivHex, encrypted] = encodedMessage.split(":");
  const ivBuffer = Buffer.from(ivHex, "hex");
  const key = crypto.scryptSync(userId, "salt", 32);
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
