# Chore Coin Backend - AI Development Guide

## Overview

This guide is designed for AI coding agents (like Claude) to efficiently develop and test the Chore Coin backend API. It leverages Hono CLI and best practices for automated development workflows.

## Quick Start for AI Agents

### Understanding the Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main Hono app entry point
│   ├── types.ts              # TypeScript type definitions
│   ├── errors.ts             # Error handling utilities
│   ├── routes/               # API route handlers
│   │   ├── auth.ts
│   │   ├── chores.ts
│   │   ├── rewards.ts
│   │   ├── history.ts
│   │   └── users.ts
│   ├── middleware/           # Custom middleware
│   ├── db/                   # Database utilities
│   └── __tests__/            # Test files
├── wrangler.toml             # Cloudflare Workers config
├── package.json              # Dependencies and scripts
└── vitest.config.ts          # Test configuration
```

## Development Workflow for AI

### 1. Running Tests Locally

**Unit and integration tests:**
```bash
npm test
```

**With UI (for debugging):**
```bash
npm test:ui
```

**With coverage:**
```bash
npm test:coverage
```

### 2. Type Checking

Always verify TypeScript types before making changes:
```bash
npm run type-check
```

### 3. Development Server

Start the local development server:
```bash
npm run dev
```

The API will be available at `http://localhost:8787`

### 4. Testing Endpoints

**Health check (no auth required):**
```bash
npm run request:health
```

**Testing protected endpoints (requires manual auth token):**
```bash
npm run request:chores
npm run request:rewards
npm run request:users
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/google` - Google OAuth login
  - Body: `{ "token": "google_id_token" }`
  - Response: `{ "token": "jwt_token", "user": { ... } }`

### Chores (Protected)
- `GET /api/chores` - Get all chores
- `POST /api/chores` - Create new chore
  - Body: `{ "title": "string", "points": number, "assignedTo?": "user_id" }`
- `PUT /api/chores/:id` - Update chore
- `DELETE /api/chores/:id` - Delete chore
- `POST /api/chores/:id/complete` - Mark chore as complete

### Rewards (Protected)
- `GET /api/rewards` - Get all rewards
- `POST /api/rewards` - Create new reward
  - Body: `{ "title": "string", "cost": number }`
- `PUT /api/rewards/:id` - Update reward
- `DELETE /api/rewards/:id` - Delete reward
- `POST /api/rewards/:id/claim` - Claim reward

### History (Protected)
- `GET /api/history` - Get activity history
  - Query params: `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/history/points` - Get points history

### Users (Protected)
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update current user
  - Body: `{ "name?": "string", "type?": "admin|parent|child" }`

## Making Code Changes

### Step 1: Understand the Current Implementation

Before making changes, read the relevant route file:
```bash
# Example: to modify chores logic
cat src/routes/chores.ts
```

### Step 2: Make Changes

Edit the file using your preferred method. Follow these principles:
- Keep functions small and focused
- Use TypeScript types (no `any`)
- Add error handling
- Follow the existing code style

### Step 3: Run Tests

```bash
npm run type-check    # Check for type errors
npm test              # Run all tests
```

### Step 4: Commit Changes

Use conventional commit format:
```bash
git add .
git commit -m "feat: add new chore category support"
# or
git commit -m "fix: correct points calculation bug"
# or
git commit -m "test: add integration tests for rewards"
```

## Error Handling Patterns

All errors should use the `AppError` class:

```typescript
import { AppError, ErrorCodes, ErrorMessages } from '../errors'

// Example usage
if (!chore) {
  throw new AppError(
    404,
    ErrorCodes.NOT_FOUND,
    ErrorMessages[ErrorCodes.NOT_FOUND]
  )
}
```

Error codes are defined in `src/errors.ts`:
- `INVALID_REQUEST` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `INTERNAL_ERROR` (500)

## Authentication for Testing

Protected endpoints require a valid JWT token in the `Authorization` header:

```bash
Authorization: Bearer <jwt_token>
```

For testing with `hono request`, include the header:
```bash
hono request -H "Authorization: Bearer token" -P /api/chores src/index.ts
```

## Database Operations

The app uses Cloudflare D1 (SQLite). Database utilities are in `src/db/`.

### Running Migrations

```bash
npm run db:migrate        # Apply migrations locally
npm run db:migrate:prod   # Apply migrations to production
```

## Debugging Tips

### 1. Enable Logging

The development server logs all requests:
```bash
npm run dev
```

Watch the console for request/response logs.

### 2. Check Tests for Examples

Integration tests show how to call each endpoint:
```bash
cat src/__tests__/integration.test.ts
```

### 3. Type Errors

If you see type errors, check:
```bash
npm run type-check
```

This gives detailed error messages.

### 4. Test a Specific Suite

```bash
npm test -- integration
npm test -- routes
npm test -- middleware
```

## Common Development Tasks

### Adding a New Endpoint

1. Create handler in appropriate route file (e.g., `src/routes/chores.ts`)
2. Add type definitions in `src/types.ts` if needed
3. Add tests in `src/__tests__/integration.test.ts`
4. Run `npm test` to verify
5. Run `npm run type-check` to verify types

### Modifying Error Handling

1. Check current error codes in `src/errors.ts`
2. Update the error definition if needed
3. Update all places that throw this error
4. Add test cases for the error scenario

### Adding Middleware

1. Create middleware in `src/middleware/`
2. Export it from the middleware file
3. Import and apply it in `src/index.ts`
4. Add tests for the middleware behavior

## Environment Variables

Local development uses `.env.local` (not committed to git):

```
GOOGLE_CLIENT_ID=your_client_id_here
JWT_SECRET=your_secret_here (dev only, use strong value in production)
D1_DB_ID=local_database_id
```

For production, secrets are set via:
```bash
wrangler secret put JWT_SECRET
wrangler secret put GOOGLE_CLIENT_ID
```

## Performance Considerations

- Database queries should use indexes where possible
- Avoid N+1 query problems
- Cache user data when appropriate
- Set reasonable timeout values (default: 5s for API calls)

## Security Checklist

Before committing code:
- [ ] No hardcoded secrets (use environment variables)
- [ ] All user inputs are validated
- [ ] All protected endpoints check authentication
- [ ] Error messages don't expose sensitive info
- [ ] CORS is properly configured

## Hono CLI Commands Available

### Request Testing (for manual testing)
```bash
npm run request:health              # GET /
npm run request:chores              # GET /api/chores
npm run request:chores:create       # POST /api/chores
npm run request:rewards             # GET /api/rewards
npm run request:users               # GET /api/users/me
```

### Testing All
```bash
npm run test:all                    # Type-check + Unit tests + Health check
npm run test:integration            # Run integration tests only
```

## Deployment

### Pre-deployment Checklist

```bash
npm run type-check      # Verify types
npm test                # Run all tests
npm run build          # Build for production
```

### Deploying to Production

```bash
# Set production secrets
wrangler secret put JWT_SECRET
wrangler secret put GOOGLE_CLIENT_ID

# Deploy
npm run deploy
```

## Resources

- [Hono Documentation](https://hono.dev)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Questions or Issues?

If something doesn't work:
1. Check the error message carefully
2. Look at existing tests for examples
3. Review the relevant route file
4. Check git history for similar changes
5. Run `npm run type-check` and `npm test` to identify the issue

---

**Last Updated:** 2024
**For:** AI Development Agents (Claude, etc.)