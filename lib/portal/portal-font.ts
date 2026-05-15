/** Map brand kit font label to Tailwind font-family utilities on the portal. */
export function portalFontClass(font: string): string {
  const key = font.trim().toLowerCase();
  if (key === "poppins") return "font-sans";
  if (key === "playfair display" || key === "playfair") {
    return "font-serif";
  }
  return "font-sans";
}
