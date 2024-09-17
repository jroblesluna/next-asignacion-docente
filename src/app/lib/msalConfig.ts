import { PublicClientApplication } from '@azure/msal-browser';

const config = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT || '',
    authority:
      'https://login.microsoftonline.com/' + process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_TENANT,
    redirectUri: '/home',
    navigateToLoginRequestUrl: false,
    postLogoutRedirectUri: '/welcome',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(config);
