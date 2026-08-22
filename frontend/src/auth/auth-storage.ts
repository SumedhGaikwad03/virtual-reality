const AUTH_TOKEN_KEY = "virtual-reality.admin.access-token";

export function getAccessToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAccessToken(accessToken: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
}

export function clearAccessToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}
