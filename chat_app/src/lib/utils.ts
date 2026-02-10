import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { IStep } from '@chainlit/react-client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasMessage = (messages: IStep[]): boolean => {
  const validTypes = ['user_message', 'assistant_message', 'tool'];
  return messages.some(
    (message) =>
      validTypes.includes(message.type) || hasMessage(message.steps || [])
  );
};

export function hslToHex(hslStr: string): string {
  // Parse HSL string
  const values = hslStr
    .split(' ')
    .map((value) => parseFloat(value.replace('%', '')));

  const h = values[0];
  const s = values[1];
  const l = values[2];

  // Convert to fractions of 1
  const hue = h / 360;
  const sat = s / 100;
  const light = l / 100;

  function hueToRgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  let r, g, b;

  if (sat === 0) {
    r = g = b = light;
  } else {
    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
    const p = 2 * light - q;

    r = hueToRgb(p, q, hue + 1 / 3);
    g = hueToRgb(p, q, hue);
    b = hueToRgb(p, q, hue - 1 / 3);
  }

  const toHex = (x: number): string => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Detect if text is right-to-left (RTL) based on the first word
 * Checks for Arabic, Hebrew, and other RTL scripts
 */
export function isRTLText(text?: string): boolean {
  if (!text || typeof text !== 'string') return false;

  // Get first word (trim whitespace, split by whitespace)
  const trimmed = text.trim();
  if (!trimmed.length) return false;

  const firstWordMatch = trimmed.match(/^[\p{L}\p{M}]+/u);
  if (!firstWordMatch) return false;

  const firstWord = firstWordMatch[0];
  if (!firstWord.length) return false;

  // Check first character for RTL scripts
  const firstChar = firstWord.charAt(0);
  const charCode = firstChar.charCodeAt(0);

  // Arabic ranges
  if (charCode >= 0x0600 && charCode <= 0x06FF) return true; // Arabic
  if (charCode >= 0x0750 && charCode <= 0x077F) return true; // Arabic Supplement
  if (charCode >= 0x08A0 && charCode <= 0x08FF) return true; // Arabic Extended-A
  if (charCode >= 0xFB50 && charCode <= 0xFDFF) return true; // Arabic Presentation Forms-A
  if (charCode >= 0xFE70 && charCode <= 0xFEFF) return true; // Arabic Presentation Forms-B

  // Hebrew range
  if (charCode >= 0x0590 && charCode <= 0x05FF) return true; // Hebrew

  // Syriac range
  if (charCode >= 0x0700 && charCode <= 0x074F) return true; // Syriac

  // Thaana (Dhivehi/Maldivian)
  if (charCode >= 0x0780 && charCode <= 0x07BF) return true; // Thaana

  // N'Ko
  if (charCode >= 0x07C0 && charCode <= 0x07FF) return true; // N'Ko

  // Mandaic
  if (charCode >= 0x0840 && charCode <= 0x085F) return true; // Mandaic

  return false;
}
