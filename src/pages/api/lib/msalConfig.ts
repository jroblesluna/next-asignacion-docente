import { Configuration } from "@azure/msal-browser";

export async function getMsalConfig() {
  const res = await fetch('/api/lib/msalEnv');
  const data = await res.json();

  if (!data.clientId || !data.tenantId) {
    throw new Error('No se pudo cargar la configuración de MSAL');
  }

  const msalConfig: Configuration = {
    auth: {
      clientId: data.clientId,
      authority: `https://login.microsoftonline.com/${data.tenantId}`,
      redirectUri: '/home',
      navigateToLoginRequestUrl: false,
      postLogoutRedirectUri: '/welcome',
      },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true,
    },
  };

  return msalConfig;
}
