# Spam Shield

Spam Shield is a Node.js application designed to provide a REST API for spam detection and IP reputation management. The application ships a static HTML front-end that consumes the same cookie-authenticated API endpoints.

## Features

- **REST API**: Submit messages for scoring, retrieve spam metrics, check IP address reputation.
- **Web Interface (Static HTML)**: Lightweight static pages (no heavy SPA) for basic admin and stats.
- **Role-Based Access**: `user` and `administrator` roles (seeded) with groundwork for expansion; first user auto-promoted to `administrator` in development.
- **Licence Management**: Per-user licence (one-to-one) supporting `unmetered` or `daily-metered` types with UTC daily reset time.
- **Authentication Workflow**: Email verification required before login; password reset flow; API key issuance. Verification emails use Handlebars templates in `src/email-templates`.
- **Unified Data Layer**: All models use Knex for queries; no direct driver calls scattered through code.
- **Auto Migrate & Seed (dev)**: On startup in development, pending migrations are applied and baseline roles ensured.
- **Database**: MySQL/MariaDB supported through `mysql2` driver.
- **Tooling**: ESLint (flat config) enforcing brace style & quality rules; Prettier for formatting.
- **Tooling**: ESLint (flat config) enforcing brace style & quality rules; Prettier for formatting; Swagger UI at `/docs/api` with raw spec at `/api-docs.json`.

## Project Structure

The project is organized into several key directories:

- `src`: Contains the main application code, including server setup, routes, controllers, services, models, and static front-end assets.
- `test`: Contains unit tests for the API and services.
- `docs`: Documentation for the API and other components.
- `.env.sample`: Template for environment variables.
- `package.json`: Configuration for npm dependencies and scripts.

## Getting Started

1. **Clone the Repository**:

   ```
   git clone <repository-url>
   cd spam-shield
   ```

2. **Install Dependencies**:

   ```
   npm install
   ```

3. **Run Migrations & Seeds (optional manual run)**:
   In development, startup will attempt to create the database if missing, apply migrations, and ensure baseline roles automatically. To run manually:

   ```
   npm run migrate:latest
   npm run seed:run
   ```

4. **Configure Environment Variables**:
   Copy `.env.sample` to `.env` and update the values as needed.

5. **Run in Development**:

   ```bash
   # Starts the server with nodemon and watches assets (JS/CSS) with esbuild
   npm run dev
   ```

   - Dev mode auto-runs pending DB migrations and seeds baseline data if needed.
   - Asset sourcemaps are enabled while watching.
   - Default port is `8080` unless overridden by `LISTEN_PORT` in `.env`.

6. **Access the Web Interface**:
   Open your browser and navigate to `http://localhost:8080` (or your configured port) to access the web UI.

## Database & Migrations

| Action                  | Command                          |
| ----------------------- | -------------------------------- |
| Create new migration    | `npm run migrate:make -- <name>` |
| Apply latest migrations | `npm run migrate:latest`         |
| Roll back last batch    | `npm run migrate:rollback`       |
| Run seeds (manual)      | `npm run seed:run`               |

Current key tables:

- `roles(id, name, created_at)`
- `users(id, email, password_hash, status_slug, created_at, updated_at)`
- `user_statuses(status_slug, description)` (seeded: `pending`, `active`)
- `user_roles(user_id, role_id, created_at)` (composite PK: user_id + role_id)
- `licences(id, user_id UNIQUE, licence_type ENUM('unmetered','daily-metered'), daily_reset_time_utc TIME NULL, created_at, updated_at)`
- `messages(id, content, created_at, updated_at)`
- `api_keys(id, user_id, label, api_key_hash, created_at)`
- `password_resets(id, user_id, reset_token_hash, expires_at, used_at, created_at)`
- `user_email_verifications(id, user_id, token_hash, expires_at, created_at)`
- `web_sessions` (express-session store, created automatically if missing)

Licence rules:

- `unmetered`: `daily_reset_time_utc` must be NULL.
- `daily-metered`: must provide `daily_reset_time_utc` (HH:MM or HH:MM:SS UTC).
  Validation lives in `src/utils/validators.js` (see `validateLicence`).

### Dev Auto-Seed Behavior

During development startup the server runs migrations, ensures baseline role rows (`user`, `administrator`), and leaves existing user-role assignments untouched.

### Model Stack

All models (messages, users, roles, licences) use Knex (`src/db/knex.js`). User-role association helpers live in `userModel` (`assignRole`, `removeRole`, `getRoles`).

## API Documentation

For detailed information on the API endpoints, please refer to the [REST API Documentation](docs/rest-api.md). All endpoints are versioned under the `/api/v3` namespace (e.g. `/api/v3/messages`, `/api/v3/ip-reputation`, `/api/v3/auth/*`).

Registration does not log a user in; they remain in `pending` status until the email verification link is consumed. Attempts to login before verification return a specific error code.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for notable changes. The `0.1.0` release marks the initial authentication workflow (email verification gating), API scaffolding, and tooling baseline.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Asset Bundling

Assets are bundled with esbuild so pages can load one CSS and minimal JS files. Static sources now live at the project root under `public/` (HTML, unbundled JS/CSS). Built bundles are written to `public/build/` (or `dist/build/` if you adopt a separate dist step):

- Entry points:
  - `src/assets/css/index.css` (Bootstrap, Bootstrap Icons, then your `styles.css`)
  - `src/assets/js/index.js` (Bootstrap JS + your `public/js/theme.js` and `public/js/main.js`)
  - Per-page bundle example: `src/public/js/dashboard.js` -> `src/public/build/dashboard.bundle.js`

- Outputs (written to `public/build/`):
  - `bundle.css` (+ font assets emitted automatically)
  - `bundle.js`
  - `dashboard.bundle.js` (used by the dashboard page)
  - `manifest.json` (list of produced runtime assets)

Commands:

```bash
# One-off production bundles (no sourcemaps)
npm run build

# Remove old bundles
npm run clean
```

Development watch uses sourcemaps; production builds do not. Built assets are ignored by Git (`public/build/*`).

To add additional app JS/CSS, import them from the respective `src/assets/*/index` file. For page-specific JS, add a separate entry (like the dashboard example) and reference the emitted bundle in your static HTML via a `<script src="/build/<name>.bundle.js" defer></script>` tag.

## Email Templates

Email templates are rendered with Handlebars:

- Templates live in `src/email-templates/*.hbs` (e.g. `verify-email.hbs`).
- Rendering and caching handled by `src/services/emailTemplates.js`.
- To add a template:
  1.  Create `src/email-templates/<name>.hbs`.
  2.  Call `mailerService.sendTemplate(to, subject, '<name>', locals)`.
  3.  Provide any required dynamic values in `locals`.

Handlebars escapes values by default; if you need raw HTML, use the triple-stash syntax (`{{{rawHtml}}}`) cautiously.

## Running in Production

1. Build assets:

   ```bash
   npm run build
   ```

   This generates `bundle.css`, `bundle.js`, any page bundles (e.g. `dashboard.bundle.js`), and `manifest.json`.

2. Start the app (production mode):

   ```bash
   npm start
   ```

   - The start script sets `NODE_ENV=production`.
   - On startup, the server verifies:
     - `src/public/build/bundle.css` and `bundle.js` exist
     - `src/public/build/manifest.json` exists
     - No `*.map` files are present in `src/public/build` (production fails if sourcemaps are detected)
   - If any required artifact is missing, the server exits with instructions to run `npm run build`.
