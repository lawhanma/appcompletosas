const brasiliaClock = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export const PREVIEW_AVAILABLE_BALANCE = 4344;

export function getPreviewTodayBalance(now: Date): number {
  const clock = brasiliaClock.formatToParts(now);
  const hour = Number(clock.find(part => part.type === "hour")?.value ?? 0);
  const minute = Number(clock.find(part => part.type === "minute")?.value ?? 0);
  const dayProgress = (hour * 60 + minute) / (24 * 60 - 1);
  return 2346 + Math.floor((3454 - 2346) * dayProgress);
}
