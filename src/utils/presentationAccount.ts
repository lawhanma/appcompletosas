// Presentation data only. This never changes the server-side membership or Auth.
export const isPresentationAccount = (email?: string) =>
  email?.trim().toLowerCase() === 'isaquelaw@gmail.com';

export const getPresentationCode = (plan: string, email?: string) =>
  plan === 'vip' || isPresentationAccount(email) ? '123456' : '101190';
