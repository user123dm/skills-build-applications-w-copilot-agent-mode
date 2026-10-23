# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep the UI route-driven and thin: each page renders only the data returned by the shared API client, with loading, empty, and error states handled at the presentation layer so the frontend remains a consumer of backend contracts rather than a source of business rules.
- Logic tier decision: Put all API behavior in Express routes/services, validate request bodies and ObjectIds before persistence, and respond with deliberate 4xx errors for invalid IDs, missing users/teams, and unknown email lookups instead of leaking cast errors or server exceptions.
- Data tier decision: Define Mongoose schemas with required fields, references, and defaults so the data layer enforces structure and seed data remains idempotent; keep computed values like points and ranking in the logic layer unless a model-level default is clearly appropriate.
- Activity tracking approach: Store user/team references, type, minutes, points, and occurredAt for every activity. Reject malformed or missing IDs with 400/404-style status codes, compute points from the submitted activity data, and return the created activity plus the computed metadata in the API response.
- Team management approach: Preserve team name, mascot, and members, and ensure list/create responses include member IDs and names in a stable shape. Reject invalid team creation without a name with 400 and keep all team membership updates consistent with the user-team reference model.
- Leaderboard approach: Aggregate activity points by team, sort descending by total points, and assign a 1-based rank in the response. Keep the payload shape to `teamName`, `totalPoints`, and `rank` so the frontend can render rankings without additional business logic.
- Workout suggestions approach: Match a user by email to their seeded profile and recent activity patterns, then recommend the first workout whose focus aligns with the user’s goal or recent activity. If no matching user is found, return a deliberate 4xx and include a reason string explaining why the suggested workout fits the user’s pattern.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — validates the Mongoose schema contract. Failures here mean the data layer is not enforcing required fields or relationships, so the API should not be implemented until the model contract is fixed.
- API command: `npm run test:api --prefix octofit-tracker/backend` — validates route behavior for activities, teams, leaderboard, and workout suggestions. Failures here indicate the logic tier still returns the wrong status codes, missing data, or incomplete business logic.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — validates presentation behavior and accessibility. Failures here mean the UI is still rendering placeholder text and not handling loading, empty, and error states from the API contract.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — verifies the TypeScript backend compiles cleanly once the data and API contracts are complete.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — verifies the React app compiles after the UI is wired to the backend contract and its state handling is correct.
