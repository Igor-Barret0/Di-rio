import crypto from "crypto";
import bcrypt from "bcryptjs";

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
