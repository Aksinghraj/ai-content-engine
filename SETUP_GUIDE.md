# AI Content Engine - Local Development Setup Guide

## Project Overview
**AI Content Engine** is a full-stack SaaS application for AI-powered content generation and multi-platform social media automation with end-to-end encryption.

**Tech Stack:**
- Frontend: React 19 + Tailwind CSS 4 + TypeScript
- Backend: Express.js + tRPC 11 + Node.js
- Database: MySQL/TiDB with Drizzle ORM
- Authentication: Manus OAuth 2.0
- Encryption: AES-256-GCM for credentials
- Testing: Vitest

---

## Prerequisites

### Required Software
- **Node.js**: v22.13.0 or higher
- **pnpm**: v9.0.0 or higher (package manager)
- **Git**: Latest version
- **MySQL/TiDB**: For local database (optional - can use remote)
- **Visual Studio Code**: Latest version (recommended)

### Installation
```bash
# Install Node.js (macOS with Homebrew)
brew install node

# Install pnpm globally
npm install -g pnpm

# Verify installations
node --version    # v22.13.0+
pnpm --version    # v9.0.0+
```

---

## Project Setup

### 1. Clone Repository
```bash
git clone https://github.com/Aksinghraj/ai-content-engine.git
cd ai-content-engine
```

### 2. Install Dependencies
```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm list
```

### 3. Environment Configuration

Create `.env.local` file in project root:
```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/ai_content_engine

# Authentication
JWT_SECRET=your-jwt-secret-key-here
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Owner Info
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge

# Social Media OAuth (Optional - for real OAuth)
INSTAGRAM_CLIENT_ID=your-instagram-app-id
INSTAGRAM_CLIENT_SECRET=your-instagram-secret
TWITTER_CLIENT_ID=your-twitter-api-key
TWITTER_CLIENT_SECRET=your-twitter-secret
LINKEDIN_CLIENT_ID=your-linkedin-app-id
LINKEDIN_CLIENT_SECRET=your-linkedin-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-secret
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-secret
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-secret

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# App Configuration
VITE_APP_TITLE=AI Content Engine
VITE_APP_LOGO=https://your-logo-url.png
```

### 4. Database Setup

#### Option A: Remote Database (Recommended for Development)
```bash
# Use the DATABASE_URL from your Manus project
# Already configured in .env.local
```

#### Option B: Local MySQL
```bash
# Install MySQL (macOS)
brew install mysql
brew services start mysql

# Create database
mysql -u root -p
> CREATE DATABASE ai_content_engine;
> EXIT;

# Update DATABASE_URL in .env.local
DATABASE_URL=mysql://root:password@localhost:3306/ai_content_engine
```

### 5. Run Database Migrations
```bash
# Generate migration from schema
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Verify database
pnpm drizzle-kit studio  # Opens Drizzle Studio UI
```

---

## Development Workflow

### Start Development Server
```bash
# Terminal 1: Start backend + frontend dev server
pnpm dev

# Server will start on http://localhost:3000
# Frontend auto-reloads on file changes
# Backend auto-restarts on file changes
```

### File Structure
```
ai-content-engine/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities (tRPC client, etc)
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   └── index.html            # HTML template
├── server/                    # Express backend
│   ├── _core/                # Core infrastructure
│   │   ├── oauth.ts          # OAuth handlers
│   │   ├── encryption.ts     # E2E encryption
│   │   ├── llm.ts            # LLM integration
│   │   └── context.ts        # tRPC context
│   ├── routers/              # tRPC routers
│   │   ├── socialMedia.ts    # Social automation
│   │   ├── enterprise.ts     # Enterprise features
│   │   └── ...
│   ├── db/                   # Database helpers
│   │   ├── social.ts         # Social media DB
│   │   └── enterprise.ts     # Enterprise DB
│   └── index.ts              # Server entry point
├── drizzle/                  # Database schema & migrations
│   ├── schema.ts             # Database tables
│   └── migrations/           # Migration files
├── shared/                   # Shared types & constants
└── package.json              # Dependencies
```

---

## Key Development Tasks

### Add New Feature

1. **Define Database Schema** (if needed)
   ```typescript
   // drizzle/schema.ts
   export const newFeature = sqliteTable('new_feature', {
     id: integer('id').primaryKey(),
     userId: integer('user_id').notNull(),
     data: text('data'),
     createdAt: integer('created_at').notNull(),
   });
   ```

2. **Generate Migration**
   ```bash
   pnpm drizzle-kit generate
   ```

3. **Create Database Helper**
   ```typescript
   // server/db/newFeature.ts
   export async function getFeatureData(userId: number) {
     const db = getDb();
     return db.query.newFeature.findMany({
       where: eq(newFeature.userId, userId),
     });
   }
   ```

4. **Create tRPC Procedure**
   ```typescript
   // server/routers/newFeature.ts
   export const newFeatureRouter = router({
     getData: protectedProcedure.query(async ({ ctx }) => {
       return getFeatureData(ctx.user.id);
     }),
   });
   ```

5. **Add to Main Router**
   ```typescript
   // server/routers.ts
   export const appRouter = router({
     newFeature: newFeatureRouter,
     // ... other routers
   });
   ```

6. **Create Frontend Component**
   ```typescript
   // client/src/pages/NewFeature.tsx
   export function NewFeature() {
     const { data } = trpc.newFeature.getData.useQuery();
     return <div>{/* UI */}</div>;
   }
   ```

7. **Write Tests**
   ```typescript
   // server/newFeature.test.ts
   describe('New Feature', () => {
     it('should fetch data', async () => {
       // Test implementation
     });
   });
   ```

### Run Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- newFeature.test.ts

# Watch mode
pnpm test -- --watch

# Coverage report
pnpm test -- --coverage
```

### Type Checking
```bash
# Check TypeScript errors
pnpm tsc --noEmit

# Watch mode
pnpm tsc --watch
```

### Build for Production
```bash
# Build frontend
pnpm build

# Build output in client/dist/
```

---

## Social Media Integration

### Connect Real OAuth Credentials

1. **Get Credentials from Each Platform**
   - [Instagram](https://developers.facebook.com/apps)
   - [Twitter/X](https://developer.twitter.com/en/portal/dashboard)
   - [LinkedIn](https://www.linkedin.com/developers)
   - [Facebook](https://developers.facebook.com/apps)
   - [YouTube](https://console.cloud.google.com)
   - [TikTok](https://developers.tiktok.com)

2. **Add to .env.local**
   ```env
   INSTAGRAM_CLIENT_ID=your-id
   INSTAGRAM_CLIENT_SECRET=your-secret
   # ... etc for other platforms
   ```

3. **Set Redirect URIs**
   For each platform, set redirect URI to:
   ```
   http://localhost:3000/auth/{platform}/callback
   ```

4. **Test Connection**
   - Go to Social Automation page
   - Click "Connect [Platform]"
   - Login with your account
   - Click "Send Test Post" to verify

---

## Debugging

### Enable Debug Logs
```bash
# Set debug environment variable
DEBUG=* pnpm dev

# Or specific module
DEBUG=trpc:* pnpm dev
```

### Browser DevTools
```bash
# Open DevTools (F12)
# Check Console tab for errors
# Check Network tab for API calls
# Check Application tab for cookies/storage
```

### Database Debugging
```bash
# Open Drizzle Studio
pnpm drizzle-kit studio

# Query database directly
# View tables and data
```

### Server Logs
```bash
# Check terminal output for server logs
# Look for [OAuth], [Error], [Warning] prefixes
```

---

## Deployment

### Push to GitHub
```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Add new feature"

# Push to main branch
git push user_github main
```

### Deploy to Manus
```bash
# Create checkpoint in Manus UI
# Click "Publish" button
# Site deployed to: aicontent-femeuybh.manus.space
```

### Deploy to Custom Domain
1. Go to Manus Management UI → Settings → Domains
2. Add your custom domain
3. Update DNS records
4. Domain will be live in 5-10 minutes

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

### Database Connection Error
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
mysql -u user -p -h host -D database
```

### OAuth Not Working
```bash
# Check credentials in .env.local
# Verify redirect URI matches platform settings
# Check browser console for errors
# Check server logs for OAuth errors
```

### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.vite

# Rebuild
pnpm install
pnpm dev
```

---

## VS Code Setup

### Recommended Extensions
1. **ES7+ React/Redux/React-Native snippets** - dsznajder.es7-react-js-snippets
2. **Tailwind CSS IntelliSense** - bradlc.vscode-tailwindcss
3. **Drizzle ORM** - drizzle-team.drizzle-orm
4. **TypeScript Vue Plugin** - Vue.volar
5. **Prettier** - esbenp.prettier-vscode
6. **ESLint** - dbaeumer.vscode-eslint

### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Launch Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/server/index.ts",
      "restart": true,
      "console": "integratedTerminal"
    }
  ]
}
```

---

## Performance Tips

1. **Use pnpm** instead of npm (faster, better disk usage)
2. **Enable TypeScript incremental compilation** for faster builds
3. **Use React.memo** for expensive components
4. **Lazy load routes** with React.lazy
5. **Optimize database queries** with proper indexes
6. **Cache API responses** with tRPC's built-in caching

---

## Security Best Practices

1. **Never commit .env files** - Use .env.local locally
2. **Rotate secrets regularly** - Update OAuth credentials monthly
3. **Use HTTPS only** - All API calls must be encrypted
4. **Validate input** - Always validate user input on backend
5. **Use prepared statements** - Prevent SQL injection
6. **Enable CORS properly** - Only allow trusted origins
7. **Implement rate limiting** - Prevent abuse
8. **Keep dependencies updated** - Run `pnpm update` regularly

---

## Support & Resources

- **Manus Docs**: https://docs.manus.im
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **tRPC Docs**: https://trpc.io
- **Drizzle ORM**: https://orm.drizzle.team
- **Tailwind CSS**: https://tailwindcss.com

---

## License
This project is proprietary. All rights reserved.

---

**Last Updated**: June 2026
**Version**: 1.0.0
