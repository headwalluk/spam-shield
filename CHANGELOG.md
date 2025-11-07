# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-11-07

### Added

- Swagger UI available at `/docs/api` with auto-generated OpenAPI spec from JSDoc annotations (`/api-docs.json`).
- `/docs` landing page in the web UI linking to API documentation.

### Changed

- All API endpoints consolidated under versioned namespace `/api/v3` (messages, IP reputation, auth).

## [0.1.0] - 2025-11-07

### Added

- Initial project scaffolding: Express server, Pug views, REST API routing (`/api`), web routes, and basic site layout.
- Database layer with Knex + MySQL: baseline migrations (roles, users, user_roles, licences, messages, auth tables) and seeds.
- Role-based access groundwork (`user`, `administrator`) with first-user auto-promotion in development.
- Authentication workflow with email verification (pending status until verified), password reset tokens, and API key issuance.
- Passport strategies: local (email/password) and header API key.
- Session management using `express-session` with Knex-backed `web_sessions` store (removed legacy custom sessions table).
- Email verification flow: token model, mailer service, Pug email template.
- Password strength validation and generator endpoint.
- IP reputation and message scaffolding endpoints/controllers (placeholders for future scoring logic).
- Initial test suites for auth and spam scoring service.

### Changed

- Registration flow now requires email verification before login (no auto-login on register).
- Removed unused legacy `sessions` table; added cleanup migration.
- Expanded all single-line conditionals to brace style to satisfy ESLint `curly: all` and improve readability.
- Added Prettier formatting across codebase; integrated ESLint (flat config) with style and quality rules.

### Fixed

- Environment normalization for `NODE_ENV`; corrected undefined variable usage.
- Crypto variable redeclaration resolved in auth service.

### Notes

This marks the end of the first development phase focusing on core authentication, scaffolding, and tooling foundation. Future phases will address richer spam scoring, IP reputation ingestion, licence metering logic, admin dashboards, and enhanced test coverage (including in-memory SQLite option for tests).
