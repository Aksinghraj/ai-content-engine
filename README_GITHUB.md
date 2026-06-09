# AI Content Engine 🚀

**Enterprise-grade AI-powered content generation and multi-platform social media automation with end-to-end encryption.**

[![Node.js](https://img.shields.io/badge/Node.js-v22.13.0-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#license)

---

## 🎯 Features

### 🤖 AI Content Generation
- Generate viral-worthy content with AI in seconds
- Customize tone, style, and format
- Multi-language support (20+ languages)
- Voice input with automatic language detection
- AI learns your unique style

### 🔗 Social Media Automation
- **6 Platform Support**: Instagram, Twitter/X, LinkedIn, Facebook, YouTube, TikTok
- **End-to-End Encrypted Credentials**: AES-256-GCM encryption
- **Real OAuth 2.0 with PKCE**: Secure account linking
- **Multi-Platform Posting**: Schedule to all platforms simultaneously
- **Test Post Verification**: Verify connections before posting
- **Smart Scheduling**: Schedule posts for optimal engagement times

### 📊 Analytics Dashboard
- Unified ROI tracking across all platforms
- Real-time engagement metrics
- Performance insights and trends
- Content performance analysis

### 🎬 Content Repurposing
- YouTube → LinkedIn/Facebook/TikTok automation
- Automatic video transcription
- Cross-platform content adaptation
- Smart formatting for each platform

### 💬 AI Chat Assistant
- Multilingual AI responses
- Voice input and output
- Context-aware conversations
- Knowledge base integration

### 🔐 Security & Privacy
- **End-to-End Encryption**: All credentials encrypted at rest
- **Secure OAuth 2.0**: PKCE flow for enhanced security
- **Token Management**: Automatic refresh and expiration handling
- **Data Privacy**: No credential storage in plain text

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Vite |
| **Backend** | Express.js, tRPC 11, Node.js |
| **Database** | MySQL/TiDB, Drizzle ORM |
| **Authentication** | Manus OAuth 2.0 |
| **Encryption** | AES-256-GCM |
| **Testing** | Vitest |
| **Deployment** | Manus Cloud |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v22.13.0+
- pnpm v9.0.0+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/Aksinghraj/ai-content-engine.git
cd ai-content-engine

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Start development server
pnpm dev
```

Server will start at `http://localhost:3000`

---

## 📖 Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** - Complete local development setup
- **[OAuth Setup](./OAUTH_SETUP_GUIDE.md)** - Social media OAuth configuration
- **[API Documentation](./API_DOCS.md)** - tRPC procedures and endpoints
- **[Architecture](./ARCHITECTURE.md)** - System design and data flow

---

## 📁 Project Structure

```
ai-content-engine/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities (tRPC client, etc)
│   │   └── App.tsx           # Main app component
│   └── index.html
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
│   └── index.ts              # Server entry point
├── drizzle/                  # Database schema & migrations
├── shared/                   # Shared types & constants
├── SETUP_GUIDE.md            # Local development guide
├── OAUTH_SETUP_GUIDE.md      # OAuth configuration guide
└── package.json
```

---

## 🔑 Key Features Explained

### Social Media Automation
1. **Connect Accounts** - Users enter credentials (encrypted with AES-256)
2. **Create Posts** - Write content or upload photos/videos
3. **Select Platforms** - Choose which platforms to post to
4. **Schedule** - Set date/time for posting
5. **Auto-Post** - System posts to all selected platforms automatically

### AI Content Generation
1. **Input Idea** - Describe what you want to create
2. **AI Generates** - System creates multiple variations
3. **Customize** - Adjust tone, length, style
4. **Publish** - Post directly or schedule for later

### Multilingual Support
- Auto-detect user language
- Respond in same language with matching tone
- Support for 20+ languages
- Voice input/output in any language

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- socialMedia.test.ts

# Watch mode
pnpm test -- --watch

# Coverage report
pnpm test -- --coverage
```

**Current Status**: ✅ 94 tests passing, 0 TypeScript errors

---

## 🔐 Security

### Encryption
- **Credentials**: AES-256-GCM encryption
- **Tokens**: Encrypted storage with automatic refresh
- **Data in Transit**: HTTPS/TLS only
- **Database**: Encrypted fields for sensitive data

### OAuth
- **PKCE Flow**: Enhanced security (RFC 7636)
- **State Parameter**: CSRF protection
- **Token Refresh**: Automatic expiration handling
- **Scope Validation**: Minimal required permissions

### Best Practices
- No credentials in logs
- Environment variables for secrets
- Regular dependency updates
- Security headers on all responses

---

## 🚀 Deployment

### Deploy to Manus Cloud
```bash
# Create checkpoint
git add .
git commit -m "Deploy new features"
git push user_github main

# In Manus UI: Click "Publish"
# Site will be live at: aicontent-femeuybh.manus.space
```

### Deploy to Custom Domain
1. Go to Manus Management UI → Settings → Domains
2. Add your custom domain
3. Update DNS records
4. Domain live in 5-10 minutes

---

## 📊 Performance

- **Frontend**: React 19 with code splitting and lazy loading
- **Backend**: tRPC with automatic caching
- **Database**: Optimized queries with proper indexing
- **API**: Sub-100ms response times
- **Build**: ~2s incremental builds

---

## 🐛 Troubleshooting

### OAuth Connection Issues
```bash
# Check credentials in .env.local
# Verify redirect URIs match platform settings
# Check browser console for errors
# Review server logs for OAuth errors
```

### Database Connection Error
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
mysql -u user -p -h host -D database
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

---

## 📚 Resources

- [Manus Documentation](https://docs.manus.im)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)

---

## 👥 Contributing

This is a proprietary project. For contributions, please contact the development team.

---

## 📄 License

**Proprietary License** - All rights reserved.

This project and all its contents are proprietary and confidential. Unauthorized copying, modification, or distribution is prohibited.

---

## 📞 Support

For issues, questions, or feature requests:
- 📧 Email: support@aicontent.engine
- 🐛 GitHub Issues: [Report a Bug](https://github.com/Aksinghraj/ai-content-engine/issues)
- 💬 Discord: [Join Community](https://discord.gg/aicontent)

---

## 🎉 Acknowledgments

Built with ❤️ using:
- React & TypeScript
- tRPC for type-safe APIs
- Tailwind CSS for styling
- Drizzle ORM for database
- Manus Cloud for hosting

---

**Version**: 1.0.0  
**Last Updated**: June 2026  
**Status**: ✅ Production Ready

---

<div align="center">

### 🌟 Star us on GitHub if you find this useful!

[⭐ Star Repository](https://github.com/Aksinghraj/ai-content-engine)

</div>
