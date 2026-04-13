import crypto from "crypto";

export function hashIdentifier(input: string): string {
  return crypto
    .createHash("sha256")
    .update(input + process.env.APP_HASH_SALT)
    .digest("hex");
}

export function validateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: "Name is too short" };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: "Name is too long" };
  }

  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim();

  if (!trimmed) {
    return { valid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Enter a valid email address" };
  }

  if (trimmed.length > 255) {
    return { valid: false, error: "Email is too long" };
  }

  return { valid: true };
}

export function validateConfession(content: string): { valid: boolean; error?: string } {
  const trimmed = content.trim();

  if (trimmed.length < 20) {
    return { valid: false, error: "Confession is too short" };
  }

  if (trimmed.length > 400) {
    return { valid: false, error: "Confession is too long" };
  }

  const lineBreaks = (trimmed.match(/\n/g) || []).length;
  if (lineBreaks > 3) {
    return { valid: false, error: "Too many line breaks" };
  }

  return { valid: true };
}

export function containsBlockedContent(content: string): { blocked: boolean; reason?: string } {
  const lower = content.toLowerCase();

  const blockedPatterns = [
    /http/i,
    /www\./i,
    /\.com\b/i,
    /\.co\.uk\b/i,
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    /\b(?:\+44|0)\d{9,10}\b/i,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(content)) {
      return { blocked: true, reason: "Contains links or contact details" };
    }
  }

  const bannedWords = [
    "kill",
    "child",
    "rape",
    "sex",
    "drug",
    "murder",
    "suicide",
    "attack",
    "terror",
    "fight",
    "fuck",
    "shit",
    "cunt",
    "twat",
    "bastard",
    "doxx"
  ];

  for (const word of bannedWords) {
    if (lower.includes(word)) {
      return { blocked: true, reason: "Contains banned phrase" };
    }
  }

  if (/([a-zA-Z0-9])\1{5,}/.test(content)) {
    return { blocked: true, reason: "Looks like spam" };
  }

  return { blocked: false };
}
