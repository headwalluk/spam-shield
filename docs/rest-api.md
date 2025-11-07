# REST API Documentation for Spam Shield

## Overview

The Spam Shield REST API provides endpoints for interacting with the spam scoring system and IP reputation services. It allows clients to submit messages for spam scoring and retrieve information about IP addresses.

## Base URL

The base URL for the API (non-auth endpoints) is:

```
http://<your-server-address>/api
```

Authentication endpoints are namespaced under:

```
http://<your-server-address>/api/v3/auth
```

## Endpoints

### 1. Message Scoring

#### POST /api/messages

Submits a message for spam scoring.

**Request Body:**

```json
{
  "text": "string",
  "fields": {
    "key": "value"
  }
}
```

**Response:**

- **200 OK**: Returns the spam score.

```json
{
  "score": "number",
  "isSpam": "boolean"
}
```

- **400 Bad Request**: If the request body is invalid.

### 2. IP Reputation

#### GET /api/ip-reputation/:ip

Retrieves the reputation information for a given IP address.

**Path Parameters:**

- `ip`: The IP address to check.

**Response:**

- **200 OK**: Returns the reputation data.

```json
{
  "ip": "string",
  "reputation": "string",
  "score": "number"
}
```

- **404 Not Found**: If the IP address is not found.

### 3. Authentication

Email verification is required before a user can log in. Most auth endpoints return JSON error codes (`EMAIL_EXISTS`, `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, etc.).

| Purpose | Method & Path | Notes |
|---------|---------------|-------|
| Register | `POST /api/v3/auth/register` | Returns user (pending status) or `EMAIL_EXISTS`. Triggers verification email. |
| Login | `POST /api/v3/auth/login` | Fails with `EMAIL_NOT_VERIFIED` until user active. Sets session cookie. |
| Me (session) | `GET /api/v3/auth/me` | Requires cookie session; returns user id/email/roles. |
| Issue API key | `POST /api/v3/auth/issue-key` | Authenticated; returns new API key string (only shown once). |
| Me (API key) | `GET /api/v3/auth/me-apikey` | Requires `X-API-Key` header. |
| Password reset request | `POST /api/v3/auth/reset-password` | Returns `{}` even if email not found (no leak). |
| Consume password reset | `POST /api/v3/auth/reset-password/consume` | Provide `token` + `password`. |
| Verify email | `GET /api/v3/auth/verify-email?token=...` | Activates user; returns user JSON. |
| Resend verification | `POST /api/v3/auth/resend-verification` | Cooldown enforced; may return `VERIFY_RESEND_COOLDOWN`. |
| Generate password | `GET /api/v3/auth/generate-password` | Returns strong generated password matching policy. |

API key auth uses a `headerapikey` strategy expecting header `X-API-Key: <key>`.

### Error Handling

All API responses will include an appropriate HTTP status code and a message in the response body for error cases.

**Example Error Response:**

```json
{
  "error": "string"
}
```

## Authentication Model

Session-based auth uses secure HTTP-only cookies. API key authentication is stateless. Email verification gates activation: newly registered users have status `pending` and receive an email with a token. Consuming the token activates (`active`).

## Rate Limiting

Not yet implemented. Future versions will include per-licence request metering and IP-based throttling.

## Conclusion

This API is designed to be simple and efficient, allowing easy integration with various clients. For further information, please refer to the other documentation files or contact the development team.
