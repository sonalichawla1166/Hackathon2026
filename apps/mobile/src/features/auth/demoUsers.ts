import { Surface, SURFACE_LABELS } from '@/state/store';

/**
 * The sign-in screen used to let anyone type any non-empty email/passcode
 * and then freely pick which of the five surfaces to land in — there was no
 * real notion of "who" was signing in. This directory replaces that: five
 * named demo users per surface, each locked to their own workspace, plus one
 * admin account that can sign in as any of them (see `LoginScreen.tsx`).
 *
 * Demo credentials only — there is no backend auth yet (see README.md).
 */
export interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: Surface;
}

export interface AdminUser {
  email: string;
  password: string;
  name: string;
}

/** Shared demo passcode for every directory account, admin included. */
export const DEMO_PASSCODE = 'demo1234';

export const ADMIN_USER: AdminUser = {
  email: 'admin@onegridai.com',
  password: DEMO_PASSCODE,
  name: 'Nora Whitcombe',
};

export const DEMO_USERS: readonly DemoUser[] = [
  // Customer app — "Maria Alvarez" is the persona the backend already has
  // seeded data for (bills, anomalies, chat history), so she stays first.
  { email: 'maria.alvarez@conedison.com', password: DEMO_PASSCODE, name: 'Maria Alvarez', role: 'app' },
  { email: 'james.foster@conedison.com', password: DEMO_PASSCODE, name: 'James Foster', role: 'app' },
  { email: 'aisha.bello@conedison.com', password: DEMO_PASSCODE, name: 'Aisha Bello', role: 'app' },
  { email: 'tom.nakamura@conedison.com', password: DEMO_PASSCODE, name: 'Tom Nakamura', role: 'app' },
  { email: 'priya.sharma@conedison.com', password: DEMO_PASSCODE, name: 'Priya Sharma', role: 'app' },

  // Public portal
  { email: 'chris.romero@conedison.com', password: DEMO_PASSCODE, name: 'Chris Romero', role: 'portal' },
  { email: 'elena.petrova@conedison.com', password: DEMO_PASSCODE, name: 'Elena Petrova', role: 'portal' },
  { email: 'sam.oconnor@conedison.com', password: DEMO_PASSCODE, name: "Sam O'Connor", role: 'portal' },
  { email: 'nina.kapoor@conedison.com', password: DEMO_PASSCODE, name: 'Nina Kapoor', role: 'portal' },
  { email: 'derek.holt@conedison.com', password: DEMO_PASSCODE, name: 'Derek Holt', role: 'portal' },

  // Ops dashboard
  { email: 'jordan.lee@conedison.com', password: DEMO_PASSCODE, name: 'Jordan Lee', role: 'ops' },
  { email: 'casey.kim@conedison.com', password: DEMO_PASSCODE, name: 'Casey Kim', role: 'ops' },
  { email: 'morgan.diaz@conedison.com', password: DEMO_PASSCODE, name: 'Morgan Diaz', role: 'ops' },
  { email: 'riley.okafor@conedison.com', password: DEMO_PASSCODE, name: 'Riley Okafor', role: 'ops' },
  { email: 'taylor.brooks@conedison.com', password: DEMO_PASSCODE, name: 'Taylor Brooks', role: 'ops' },

  // Agent copilot
  { email: 'alex.chen@conedison.com', password: DEMO_PASSCODE, name: 'Alex Chen', role: 'copilot' },
  { email: 'jordan.blake@conedison.com', password: DEMO_PASSCODE, name: 'Jordan Blake', role: 'copilot' },
  { email: 'morgan.reyes@conedison.com', password: DEMO_PASSCODE, name: 'Morgan Reyes', role: 'copilot' },
  { email: 'drew.hassan@conedison.com', password: DEMO_PASSCODE, name: 'Drew Hassan', role: 'copilot' },
  { email: 'sasha.lund@conedison.com', password: DEMO_PASSCODE, name: 'Sasha Lund', role: 'copilot' },

  // Field sales — Jamie Ortiz and Sydney Boone match the rep initials
  // ("J. Ortiz" / "S. Boone") already seeded in the door-knock history in
  // apps/backend/app/data.py, so the demo reps line up with their own past visits.
  { email: 'jamie.ortiz@onegridai.com', password: DEMO_PASSCODE, name: 'Jamie Ortiz', role: 'sales' },
  { email: 'sydney.boone@onegridai.com', password: DEMO_PASSCODE, name: 'Sydney Boone', role: 'sales' },
  { email: 'devon.ruiz@onegridai.com', password: DEMO_PASSCODE, name: 'Devon Ruiz', role: 'sales' },
  { email: 'casey.lin@onegridai.com', password: DEMO_PASSCODE, name: 'Casey Lin', role: 'sales' },
  { email: 'ariana.flores@onegridai.com', password: DEMO_PASSCODE, name: 'Ariana Flores', role: 'sales' },
] as const;

export interface DemoUserGroup {
  role: Surface;
  label: string;
  users: DemoUser[];
}

/** `DEMO_USERS` grouped by surface, in `SURFACE_LABELS` order — what the
 * account picker renders as its five sections. */
export const DEMO_USER_GROUPS: readonly DemoUserGroup[] = (Object.keys(SURFACE_LABELS) as Surface[]).map((role) => ({
  role,
  label: SURFACE_LABELS[role],
  users: DEMO_USERS.filter((u) => u.role === role),
}));

function matches(email: string, password: string, candidateEmail: string, candidatePassword: string): boolean {
  return email.trim().toLowerCase() === candidateEmail.toLowerCase() && password === candidatePassword;
}

export function isAdminCredentials(email: string, password: string): boolean {
  return matches(email, password, ADMIN_USER.email, ADMIN_USER.password);
}

export function findDemoUser(email: string, password: string): DemoUser | null {
  return DEMO_USERS.find((u) => matches(email, password, u.email, u.password)) ?? null;
}
