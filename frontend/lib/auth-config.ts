import type { UserManagerSettings } from "oidc-client-ts";

// Cognito's coordinates. NEXT_PUBLIC_* is substituted at build time, so these
// come from the auth stack's outputs (scripts/deploy-frontend.sh reads them).
// Without them the site works as before, with no sign-in.
export const authority = process.env.NEXT_PUBLIC_COGNITO_AUTHORITY ?? "";
export const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "";
export const cognitoDomain = (
  process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? ""
).replace(/\/$/, "");

export const authEnabled = Boolean(authority && clientId && cognitoDomain);

/**
 * Settings for oidc-client-ts. `origin` is the site's own origin; it is a
 * parameter because the static export is prerendered where there is no window.
 *
 * The redirect URI has no trailing slash: that is the URL the page really has
 * after the router has normalised it, and Cognito needs an exact match (the
 * auth stack lists both spellings).
 */
export function buildOidcSettings(origin: string): UserManagerSettings {
  return {
    authority,
    client_id: clientId,
    redirect_uri: `${origin}/auth/callback`,
    post_logout_redirect_uri: `${origin}/`,
    response_type: "code",
    scope: "openid email profile",
  };
}

/**
 * Cognito has no OIDC end-session endpoint; signing out is a visit to its own
 * /logout, which clears Cognito's session cookie and returns to `logout_uri`.
 */
export function buildLogoutUrl(
  origin: string,
  domain: string = cognitoDomain,
  client: string = clientId,
): string {
  const params = new URLSearchParams({
    client_id: client,
    logout_uri: `${origin}/`,
  });
  return `${domain}/logout?${params.toString()}`;
}
