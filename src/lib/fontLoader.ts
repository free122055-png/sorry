import { FontItem } from "../data/pixelEditorData";

// Track loaded font faces and stylesheets to prevent duplicate loads
const loadedFontFamilies = new Set<string>();
const loadedStylesheets = new Set<string>();

export interface CustomCloudFont extends FontItem {
  fontDataUrl?: string;
  fontUrl?: string;
  cssUrl?: string;
  format?: string;
  fileSize?: string;
  isActive?: boolean;
  createdAt?: string;
}

/**
 * Dynamically loads a custom font face into document.fonts or appends a CSS stylesheet
 */
export async function loadCustomFont(font: CustomCloudFont): Promise<boolean> {
  if (!font.name && !font.family) return false;

  const rawFamilyName = extractPrimaryFamily(font.family);

  // Load stylesheet if provided
  if (font.cssUrl && !loadedStylesheets.has(font.cssUrl)) {
    try {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = font.cssUrl;
      document.head.appendChild(link);
      loadedStylesheets.add(font.cssUrl);
    } catch (e) {
      console.warn("Failed to attach font stylesheet:", font.cssUrl, e);
    }
  }

  // Load font buffer / data URL if available
  const fontSource = font.fontDataUrl || font.fontUrl;
  if (fontSource && rawFamilyName && !loadedFontFamilies.has(rawFamilyName)) {
    try {
      const fontFace = new FontFace(rawFamilyName, `url(${fontSource})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      loadedFontFamilies.add(rawFamilyName);
      return true;
    } catch (err) {
      console.error(`Failed to register FontFace "${rawFamilyName}":`, err);
      return false;
    }
  }

  return true;
}

/**
 * Loads a batch of custom fonts
 */
export async function loadAllCustomFonts(fonts: CustomCloudFont[]): Promise<void> {
  const promises = fonts.map(f => loadCustomFont(f));
  await Promise.allSettled(promises);
}

/**
 * Extracts the clean primary family name without quotes or fallbacks
 * e.g. "'Hind Siliguri', sans-serif" -> "Hind Siliguri"
 */
export function extractPrimaryFamily(familyStr: string): string {
  if (!familyStr) return "sans-serif";
  const first = familyStr.split(",")[0].trim();
  return first.replace(/^['"]+|['"]+$/g, "");
}
