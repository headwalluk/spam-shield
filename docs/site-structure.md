# Website structure

## HTML Endpoints

NOTE: URLs are based on `LISTEN_PORT` and `SERVER_BASE_URL` in `env.sample`. Adjust URLs based on what's in your project's `.env` file.

`http://localhost:8080/`
Publicly visible, point-of-sale content to be decided later.

`http://localhost:8080/privacy`
Publicly visible, static privacy policy content.

`http://localhost:8080/login`
`http://localhost:8080/register`
`http://localhost:8080/reset-password`
Authentication workflow. Registration does NOT log the user in; they must verify their email (token sent) before login succeeds. The "/register" and "/reset-password" routes will redirect to the login page if the env var `AUTH_ENABLE_REGISTRATION == false`.

`http://localhost:8080/dash`
Private dashboard. Visible to authenticated, verified users. Unauthenticated or pending users are redirected to `/login`. Planned: usage metrics, licence info, charts.

`http://localhost:8080/dash/users`
Planned: Only available to users in the `administrator` role. Will contain a list of all users, searchable and with paging, plus CRUD actions.

`http://localhost:8080/dash/licence`
Planned: Available to users in the `user` role. Will display licence details and allow cancellation request.
