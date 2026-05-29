import { useCallback, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';

/**
 * Thin wrapper around MSAL that exposes the bits the rest of the app actually
 * cares about: whether we're authenticated, the active user, and helpers to
 * trigger login/logout flows. Keeping this in one place means components don't
 * have to know about MSAL specifics.
 */
export function useAuth() {
  const { instance, accounts } = useMsal();

  const isAuthenticated = accounts.length > 0;
  const account = accounts[0];

  const login = useCallback(() => instance.loginRedirect(loginRequest), [instance]);
  const logout = useCallback(() => instance.logoutRedirect(), [instance]);

  const getAccessToken = useCallback(async () => {
    if (!account) throw new Error('No signed-in account');
    const response = await instance.acquireTokenSilent({ ...loginRequest, account });
    return response.accessToken;
  }, [instance, account]);

  const displayName = useMemo(() => {
    if (!account?.username) return undefined;
    return account.username.split('@')[0];
  }, [account]);

  return {
    accounts,
    account,
    isAuthenticated,
    displayName,
    username: account?.username,
    login,
    logout,
    getAccessToken,
  };
}
