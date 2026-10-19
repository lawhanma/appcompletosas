import type { GroupPlatform } from '../data/facebookGroups';

// A valid format does not prove that a group still exists or accepts posts.
export function normalizeGroupLink(value: string, platform?: GroupPlatform): string | null {
  try {
    const input = value.trim();
    if (!input || /\s/.test(input)) return null;
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    let detected: GroupPlatform;
    if (host === 'chat.whatsapp.com' && /^\/(?:invite\/)?[A-Za-z0-9]{22}\/?$/.test(url.pathname)) {
      detected = 'whatsapp';
      url.pathname = url.pathname.replace('/invite/', '/');
    } else if (host === 't.me' && /^\/(?:[A-Za-z][A-Za-z0-9_]{4,31}|\+[A-Za-z0-9_-]{8,})\/?$/.test(url.pathname)) {
      detected = 'telegram';
    } else if (['facebook.com', 'www.facebook.com', 'm.facebook.com'].includes(host) && /^\/groups\/[A-Za-z0-9._-]+\/?$/.test(url.pathname) && !/^\/groups\/(search|feed|discover)\/?$/.test(url.pathname)) {
      detected = 'facebook';
    } else return null;
    if (platform && platform !== detected) return null;
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}
