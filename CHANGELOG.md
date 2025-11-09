# Changelog

## [0.5.0] - 2025-11-09

### Added

- New lookup list: Salutations
  - Migration creating `salutations` table (phrase unique, score default 0)
  - Model with in-memory cache, server-side pagination, and CRUD
  - API: `GET/POST/PUT/DELETE /api/v3/salutations` (admin-only)
  - Admin UI at `/admin/salutations` with search, modal editing, and condensed pagination
  - Seed with several common salutations (score 0)
- Admin state tile linking to the new Salutations page

### Changed

- Bad Phrases admin list moved to server-side pagination with search windowing for scalability
- Classification endpoint unified at `POST /api/v3/messages` (replacing legacy `/classify`) with:
  - Role restriction: only users with role `user` may invoke
  - Minimal response `{ result, timing }` to reduce PII exposure
  - Support for hints (forceToSpam, countryRestrictions, scriptRestriction)
- Countries API: `GET /api/v3/countries/{code2}` now returns absolute `flagUrl`; admin editing retained under `/api/v3/countries`
- API navigation state at `GET /api/v3/state` updated with Admin tiles (Users, Countries, Bad Phrases, Salutations)

### Removed

- Legacy `/api/v3/classify` route in favor of `POST /api/v3/messages`

### Docs

- Expanded Swagger/OpenAPI JSDoc across endpoints (state, api-keys, salutations, bad-phrases, messages, auth, roles, user-statuses, countries)

## [0.4.0] - 2025-11-08

- Major refactor. Got rid of Pug and replaced it with static HTML assets and mor ein-browser rendering.

## [0.3.2] - 2025-11-08

### Added

- Handlebars-based email templating system (`src/email-templates/*.hbs`).
- Template loader/cacher (`src/services/emailTemplates.js`).
- Unit tests for template rendering (`emailTemplates.test.js`).

### Changed

- `mailerService` now renders emails via Handlebars templates instead of inline string construction.

### Notes

- To add new emails, drop a `<name>.hbs` in `src/email-templates` and call `mailerService.sendTemplate(to, subject, '<name>', locals)`.

## [0.3.3] - 2025-11-08

### Changed

- Moved static asset sources from `src/public` to root-level `public/` for a cleaner `src/` tree.
- Build output directory updated to `public/build/` (supports future optional `dist/` usage).
- Server now serves from `public/` and, if present, `dist/` first.
- Updated nodemon watch paths and README documentation accordingly.

### Notes

- Existing HTML pages now reside under `public/html`. Update any deployment scripts expecting `src/public`.

## [0.3.1] - 2025-11-08

### Changed

- Removed Pug templating from the application. Front-end is now fully static HTML + JS consuming cookie-authenticated APIs.
- Email templates no longer rely on Pug; replaced with a lightweight inline HTML renderer for the verification email.
- Development watcher updated to stop monitoring `.pug` files.

### Notes

This completes the transition away from SSR templates. Future emails can use simple HTML template functions or a minimal templating helper if needed.

## [0.3.0] - 2025-11-08

### Added

- Front-end asset bundling pipeline using esbuild (CSS & JS) producing `bundle.css`, `bundle.js`, and page-specific `dashboard.bundle.js`.
- Asset `manifest.json` emitted on build for production verification.
- Production startup safety checks: required asset presence, manifest existence, and rejection of source maps.
- Clean script (`npm run clean`) to remove stale build artifacts before rebuilding.
- Dashboard enhancements: API key tooltip copy interactions and modal behavior with per-page JS bundle.

### Changed

- `npm start` now forces `NODE_ENV=production` to ensure secure cookie settings and disable dev behaviors.
- Build script refactored to use esbuild context API for watch mode; disabled sourcemaps in production builds.
- README expanded with clear development vs production workflow instructions and bundling documentation.
- Converted global bootstrap usages to module imports (e.g. Tooltip) and removed reliance on CDN assets.
- Server performs early exit if assets missing or source maps detected in production.

### Fixed

- Resolved TypeError from outdated `connect-session-knex` factory usage by switching to class export.
- Eliminated global `bootstrap` reference error by bundling dashboard code and using module imports.
- Lint issues (curly rule, no-unused-vars, crypto redeclaration) cleaned across build and server files.

### Notes

This release focuses on build optimization, production robustness, and front-end consolidation. Next steps may include content-hashed filenames, PurgeCSS/unused CSS reduction, asset manifest-driven template injection, and enhanced spam/IP scoring logic.

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
