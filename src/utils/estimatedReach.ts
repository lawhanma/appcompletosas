// Illustration only: deliberately independent of money, sales and measured analytics.
export function illustrativeReach(seed:string):number {
 let hash=2166136261;
 for(const char of seed)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
 return 200+(hash%1801);
}
