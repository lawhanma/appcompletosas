export type MissionEvent = 'product' | 'link' | 'campaign' | 'post';
export interface MissionProgress {
  day: string;
  checkedIn: boolean;
  products: string[];
  links: string[];
  campaigns: string[];
  posts: number;
}
export const missionDay = (date = new Date()) => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(date);
export const missionKey = (email: string) => `shopgo_daily_missions_v1:${email.trim().toLowerCase()}`;
export const freshMissions = (day = missionDay()): MissionProgress =>
  ({day, checkedIn: true, products: [], links: [], campaigns: [], posts: 0});
export function readMissions(raw: string | null, day = missionDay()): MissionProgress {
  try {
    const value = JSON.parse(raw || 'null');
    if (value?.day !== day) return freshMissions(day);
    const ids = (items: unknown, limit: number): string[] => Array.isArray(items)
      ? [...new Set(items.filter((v): v is string => typeof v === 'string'))].slice(0, limit) : [];
    return {day, checkedIn: true, products: ids(value.products,3), links: ids(value.links,2),
      campaigns: ids(value.campaigns,1), posts: Number.isFinite(value.posts) ? Math.max(0,Math.min(5,Math.floor(value.posts))) : 0};
  } catch {return freshMissions(day);}
}
export function advanceMission(previous: MissionProgress, event: MissionEvent, id: string, day = missionDay()): MissionProgress {
  const next = previous.day === day ? previous : freshMissions(day);
  if (event === 'post') return {...next, posts: Math.min(5,next.posts+1)};
  const key = event === 'product' ? 'products' : event === 'link' ? 'links' : 'campaigns';
  const limit = event === 'product' ? 3 : event === 'link' ? 2 : 1;
  if (!id || next[key].includes(id) || next[key].length >= limit) return next;
  return {...next, [key]: [...next[key],id]};
}
