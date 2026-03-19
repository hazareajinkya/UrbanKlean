import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { ENCRYPTION_SECRET } from "./conf";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

const getKey = (): Buffer => {
    const key = ENCRYPTION_SECRET;
    if (!key) {
        throw new Error("ENCRYPTION_SECRET is not set");
    }
    return scryptSync(key, "salt", 32);
};

export const encrypt = (value: string): string => {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
};

export const decrypt = (value: string): string => {
    const [ivHex, encrypted] = value.split(":");
    if (!ivHex || !encrypted) {

        return value;
    }
    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
