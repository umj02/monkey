import { useLocalStorageState } from "@/lib/local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { createMockSession, createSocialMockSession } from "@/lib/services/auth-service";
import type { AuthSession, Profile } from "@/types";

export function useAuth() {
  const [session, setSession, ready] = useLocalStorageState<AuthSession | null>(STORAGE_KEYS.authSession, null);

  return {
    session,
    ready,
    isAuthenticated: Boolean(session),
    loginWithProfile: (profile: Profile) => setSession(createMockSession(profile)),
    loginWithSocial: (provider: AuthSession["provider"]) => setSession(createSocialMockSession(provider)),
    logout: () => setSession(null)
  };
}
