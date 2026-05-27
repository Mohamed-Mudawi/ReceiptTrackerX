export const msalConfig = {
  auth: {
    clientId: "dfbddd7c-f8aa-4496-892a-e9df00883bce",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:5173",
    postLogoutRedirectUri: "http://localhost:5173",
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["api://edd6dde2-5be3-4ec4-8fa0-eb2fb1e8025a/access_as_user"],
  prompt: "select_account",
};