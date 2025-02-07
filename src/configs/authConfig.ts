import { Configuration } from '@azure/msal-browser';

export const MSALConfig: Configuration = {
  auth: {
    clientId:  "e7e30e0d-9069-4c07-a37c-b30dc1ce2c9e",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "/",
    OIDCOptions: {
      defaultScopes: ['openid', 'profile', 'User.Read', 'email']
    },
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  },
}

export const GoogleConfig = {
  clientId:  "652195495981-sk46duu29ej7o28takl9lujov86uvfq9.apps.googleusercontent.com",
}