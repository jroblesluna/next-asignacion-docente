import { Configuration, LogLevel } from '@azure/msal-browser';
const IdClient = import.meta.env.VITE_AZURE_WEBAPP_ID_CLIENT;
const IdTenat = import.meta.env.VITE_AZURE_WEBAPP_ID_TENANT;

// Definición de la configuración de MSAL
export const msalConfig: Configuration = {
  auth: {
    clientId: IdClient,
    authority: 'https://login.microsoftonline.com/' + IdTenat,
    redirectUri: '/',
    postLogoutRedirectUri: '/',
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
        }
      },
    },
  },
};

// Definición de la solicitud de inicio de sesión
export const loginRequest = {
  scopes: ['user.read'],
};
