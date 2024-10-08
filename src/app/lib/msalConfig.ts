import { PublicClientApplication } from '@azure/msal-browser';

const config = {
  auth: {
    clientId:
      process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT || 'cea39403-2b37-4bde-9cae-c9246ebdd03b',
    authority: 'https://login.microsoftonline.com/' + 'c25f5a9d-1acb-41dc-8777-55458159b9d9',
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
