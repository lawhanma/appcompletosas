// Profile badge only. Membership and access are determined independently.
export const isPresentationAccount = (email?: string) =>
  email?.trim().toLowerCase() === 'isaquelaw@gmail.com';

export const getAccountPlanCode = (plan: string) =>
  plan === 'vip' ? '123456' : plan === 'free' ? 'free' : '101190';
