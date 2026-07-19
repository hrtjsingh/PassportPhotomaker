import { USE_ML_BACKEND } from '../config/backend';
import { isClerkEnabled } from '../config/clerk';

type TokenGetter = () => Promise<string | null>;
type SignedInChecker = () => boolean;

let getToken: TokenGetter | null = null;
let isSignedIn: SignedInChecker = () => false;

export function registerMlAuth(auth: {
  getToken: TokenGetter;
  isSignedIn: SignedInChecker;
}): void {
  getToken = auth.getToken;
  isSignedIn = auth.isSignedIn;
}

export function clearMlAuth(): void {
  getToken = null;
  isSignedIn = () => false;
}

/** Backend ML only when Clerk enabled, user signed in, and backend mode on. */
export function canUseMlBackend(): boolean {
  return USE_ML_BACKEND && isClerkEnabled && isSignedIn();
}

export async function getMlAuthHeaders(): Promise<Record<string, string>> {
  if (!canUseMlBackend() || !getToken) return {};
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
