import crypto from "crypto";

export function generateJoinCode(length = 8) {
  return crypto.randomBytes(length).toString("hex").slice(0, length).toUpperCase();
}

export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
