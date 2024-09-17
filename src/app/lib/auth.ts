// src/lib/auth.ts

import { msalInstance } from './msalConfig';
import { AuthenticationResult } from '@azure/msal-browser';

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const result: AuthenticationResult = await msalInstance.acquireTokenSilent({
      scopes: ['user.read'],
      account: msalInstance.getAllAccounts()[0],
    });
    console.log(token);
    return !!result.accessToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}
