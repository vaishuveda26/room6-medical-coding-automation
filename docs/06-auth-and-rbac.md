# 6. Authentication and RBAC

## Authentication Strategy

- JWT bearer tokens for stateless auth
- Token payload includes `sub` = user ID
- Token expiration controlled by env setting

## Password Strategy

- Passwords are hashed before storage
- Verification compares plain input against hash
- Current implementation includes compatibility fallback to avoid runtime issues in environments with bcrypt backend mismatch

## Backend Auth Flow

1. User logs in (`/auth/login`)
2. API validates credentials
3. API returns signed JWT
4. Client sends JWT in bearer header
5. Dependency decodes token and loads current user

## Authorization (Role Enforcement)

- Central role guard function: `require_role(...)`
- Route-level dependency injection enforces allowed roles

Examples:
- Admin-only: patients create/delete
- Admin/Doctor: appointments list, dashboard stats
- Doctor ownership checks for appointment updates

## Frontend Session Handling

- Token and basic user metadata are stored in `localStorage`
- Axios interceptor injects `Authorization` automatically
- Protected routes redirect unauthenticated users to `/login`
- Role-based route wrappers prevent unauthorized page access

## Security Considerations

- Rotate `SECRET_KEY` in production
- Use HTTPS in all deployed environments
- Prefer short token TTL with refresh strategy (future improvement)
- Add brute-force/rate-limiting middleware (future improvement)
- Consider moving from localStorage to secure cookie flow in stricter threat models
