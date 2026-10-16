export function validateAffiliateLink(value: string): string | null {
  const link = value.trim();
  if (!link || link.length > 2048 || /\s/.test(link)) return null;
  try {
    const url = new URL(link);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null;
    return link; // Preserve the affiliate's complete tracking URL.
  } catch {return null;}
}
