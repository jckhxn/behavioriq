import { NextResponse } from "next/server";

/**
 * GET /.well-known/oauth-authorization-server
 * OAuth 2.1 Authorization Server Discovery endpoint
 * Used by ChatGPT Apps SDK to discover OAuth endpoints
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://app.behavioriq.com";

  const discoveryDocument = {
    // Required OAuth 2.1 metadata
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/oauth/authorize`,
    token_endpoint: `${baseUrl}/api/oauth/token`,
    introspection_endpoint: `${baseUrl}/api/oauth/introspect`,
    revocation_endpoint: `${baseUrl}/api/oauth/revoke`,

    // Service metadata
    service_documentation: `${baseUrl}/docs/api`,
    api_documentation: `${baseUrl}/docs`,

    // PKCE support (required for public clients like ChatGPT widgets)
    code_challenge_methods_supported: [
      "S256", // SHA256
      "plain",
    ],

    // Response types and grant types
    response_types_supported: [
      "code",
      "code id_token",
      "code id_token token",
      "token",
      "id_token",
    ],
    response_modes_supported: ["query", "fragment"],
    grant_types_supported: [
      "authorization_code",
      "refresh_token",
      "client_credentials",
    ],

    // OAuth 2.1 endpoints
    oauth_protocol_version: "2.1",
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256", "HS256"],
    request_parameter_supported: false,
    request_uri_parameter_supported: false,

    // Scopes
    scopes_supported: [
      "openid",
      "profile",
      "email",
      "offline_access",
      "assessments:read",
      "assessments:write",
      "results:read",
      "credits:read",
    ],

    // Claims
    claims_supported: [
      "aud",
      "auth_time",
      "email",
      "email_verified",
      "exp",
      "iat",
      "iss",
      "name",
      "sub",
      "user_id",
      "credits",
      "plan",
    ],
    claim_types_supported: ["normal", "aggregated", "distributed"],

    // UI locales
    ui_locales_supported: [
      "en-US",
      "es-ES",
      "fr-FR",
      "de-DE",
      "ja-JP",
      "zh-CN",
    ],

    // Token endpoint authentication methods
    token_endpoint_auth_methods_supported: [
      "client_secret_basic",
      "client_secret_post",
      "none", // For public clients like ChatGPT widgets
    ],

    // Registration endpoint
    registration_endpoint: `${baseUrl}/api/oauth/register`,

    // Additional metadata for ChatGPT integration
    userinfo_endpoint: `${baseUrl}/api/oauth/userinfo`,
    check_session_iframe: `${baseUrl}/api/oauth/check-session`,
    end_session_endpoint: `${baseUrl}/api/oauth/logout`,

    // Claim details
    claims_parameter_supported: true,
    acr_values_supported: ["urn:mace:incommon:iap:silver"],

    // TLS requirements
    require_https: process.env.NODE_ENV === "production",
    require_request_uri_registration: false,

    // Frontchannel logout
    frontchannel_logout_session_supported: true,
    frontchannel_logout_supported: true,

    // Request object
    request_object_signing_alg_values_supported: [
      "RS256",
      "ES256",
      "HS256",
      "none",
    ],
    request_object_encryption_alg_values_supported: [
      "RSA1_5",
      "RSA-OAEP",
      "A128KW",
      "A192KW",
      "A256KW",
      "dir",
      "ECDH-ES",
    ],
    request_object_encryption_enc_values_supported: [
      "A128CBC-HS256",
      "A192CBC-HS384",
      "A256CBC-HS512",
      "A128GCM",
      "A192GCM",
      "A256GCM",
    ],

    // ID Token
    id_token_encryption_alg_values_supported: [
      "RSA1_5",
      "RSA-OAEP",
      "A128KW",
      "A192KW",
      "A256KW",
      "dir",
      "ECDH-ES",
    ],
    id_token_encryption_enc_values_supported: [
      "A128CBC-HS256",
      "A192CBC-HS384",
      "A256CBC-HS512",
      "A128GCM",
      "A192GCM",
      "A256GCM",
    ],

    // Userinfo
    userinfo_signing_alg_values_supported: ["RS256", "HS256"],
    userinfo_encryption_alg_values_supported: [
      "RSA1_5",
      "RSA-OAEP",
      "A128KW",
      "A192KW",
      "A256KW",
      "dir",
      "ECDH-ES",
    ],
    userinfo_encryption_enc_values_supported: [
      "A128CBC-HS256",
      "A192CBC-HS384",
      "A256CBC-HS512",
      "A128GCM",
      "A192GCM",
      "A256GCM",
    ],
  };

  return NextResponse.json(discoveryDocument, {
    headers: {
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      "Content-Type": "application/json",
    },
  });
}
