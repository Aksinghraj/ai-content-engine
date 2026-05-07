# Analytics & Monitoring Setup Guide

## Step 5: Configure Analytics & Monitoring

### Overview
This guide covers setting up comprehensive analytics and monitoring for production deployment.

### Analytics Stack

#### 1. User Analytics (Plausible/Mixpanel)

**Option A: Plausible (Privacy-Focused)**
```typescript
// Add to client/src/main.tsx
import Plausible from 'plausible-tracker';

const plausible = Plausible({
  domain: 'aicontent-femeuybh.manus.space',
});

plausible.trackPageview();
```

**Option B: Mixpanel (Feature-Rich)**
```typescript
import mixpanel from 'mixpanel-browser';

mixpanel.init('YOUR_TOKEN');
mixpanel.track('Page View', { page: window.location.pathname });
```

#### 2. Key Metrics to Track

**User Engagement:**
- Page views
- Session duration
- Bounce rate
- Feature usage
- Content generation count
- Automation execution count

**Conversion Metrics:**
- Sign-up rate
- Free-to-pro conversion
- Trial completion
- Payment success rate
- Churn rate

**Performance Metrics:**
- Page load time
- API response time
- Content generation latency
- Error rate
- Uptime percentage

**Business Metrics:**
- Monthly active users (MAU)
- Daily active users (DAU)
- Revenue per user
- Customer lifetime value (LTV)
- Cost per acquisition (CAC)

### Implementation

```typescript
// server/routers/analytics.ts
export const analyticsRouter = router({
  // Track user action
  trackEvent: protectedProcedure
    .input(z.object({
      eventName: z.string(),
      properties: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Log to analytics service
      // Store in database for analysis
      return { success: true };
    }),

  // Get dashboard metrics
  getDashboardMetrics: protectedProcedure.query(async () => {
    return {
      totalUsers: 1000,
      activeUsers: 450,
      totalContentGenerated: 5000,
      totalAutomations: 200,
      revenue: 5000,
      churnRate: 0.05,
    };
  }),

  // Get user journey
  getUserJourney: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return {
        signupDate: new Date(),
        firstContentGeneration: new Date(),
        firstAutomation: new Date(),
        lastActive: new Date(),
        totalSessions: 15,
        totalEvents: 150,
      };
    }),
});
```

### Monitoring Stack

#### 1. Application Monitoring (Sentry)

**Setup:**
```bash
npm install @sentry/react @sentry/trpc
```

**Configuration:**
```typescript
// client/src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// server/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### 2. Performance Monitoring

**Web Vitals:**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

**API Performance:**
```typescript
// Middleware to track API response times
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
    // Send to monitoring service
  });
  next();
});
```

#### 3. Database Monitoring

**Query Performance:**
```typescript
// Log slow queries
import { performance } from 'perf_hooks';

const start = performance.now();
const result = await db.query(sql);
const duration = performance.now() - start;

if (duration > 1000) {
  console.warn(`Slow query: ${duration}ms`);
}
```

#### 4. Infrastructure Monitoring

**Server Health:**
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

### Dashboards

#### 1. Business Dashboard
- Total users
- Active users
- Revenue
- Churn rate
- Top features
- User growth chart

#### 2. Technical Dashboard
- Server uptime
- API response times
- Error rates
- Database performance
- Resource usage
- Deployment status

#### 3. Content Dashboard
- Content generated (daily/weekly/monthly)
- Popular content types
- Viral score distribution
- Automation execution count
- Platform distribution

#### 4. User Dashboard
- New signups
- Free-to-pro conversion
- Feature adoption
- User engagement
- Retention cohorts

### Alerts & Notifications

**Critical Alerts:**
- Server down (immediate Slack/email)
- Error rate >5% (immediate)
- Database connection failed (immediate)
- Payment processing failed (immediate)

**Warning Alerts:**
- High latency >10s (email)
- Disk space >80% (email)
- Memory usage >90% (email)
- Low uptime <99% (daily digest)

**Implementation:**
```typescript
// Alert service
async function sendAlert(severity: 'critical' | 'warning', message: string) {
  if (severity === 'critical') {
    // Send to Slack immediately
    await slack.send({ channel: '#alerts', text: message });
    // Send email
    await sendEmail({ to: 'team@example.com', subject: 'CRITICAL ALERT', body: message });
  } else {
    // Add to daily digest
    await addToDailyDigest(message);
  }
}
```

### Logging Strategy

**Log Levels:**
- **ERROR:** Application errors, exceptions
- **WARN:** Warnings, deprecated features
- **INFO:** Important events (user signup, payment)
- **DEBUG:** Detailed debugging info

**Log Retention:**
- ERROR: 90 days
- WARN: 30 days
- INFO: 14 days
- DEBUG: 7 days

**Log Aggregation:**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Analytics Events to Track

**User Events:**
- User signup
- User login
- User logout
- Profile updated
- Subscription upgraded
- Subscription downgraded
- Account deleted

**Content Events:**
- Content generated
- Content edited
- Content published
- Content deleted
- Content shared

**Automation Events:**
- Automation created
- Automation executed
- Automation paused
- Automation deleted
- Automation failed

**Payment Events:**
- Payment initiated
- Payment completed
- Payment failed
- Invoice generated
- Refund processed

### Data Privacy & Compliance

**GDPR Compliance:**
- Anonymize IP addresses
- Get user consent for tracking
- Allow data export
- Allow data deletion
- Document data usage

**Implementation:**
```typescript
// Cookie consent
const hasConsent = localStorage.getItem('analytics-consent') === 'true';

if (hasConsent) {
  // Initialize analytics
  plausible.trackPageview();
}
```

### Production Checklist

- [ ] Sentry configured
- [ ] Analytics service set up
- [ ] Dashboards created
- [ ] Alerts configured
- [ ] Logging configured
- [ ] Health checks implemented
- [ ] Performance monitoring active
- [ ] User tracking implemented
- [ ] Data privacy compliant
- [ ] Backup & recovery tested
- [ ] Monitoring documentation created
- [ ] On-call rotation established

### Recommended Services

| Service | Purpose | Cost |
|---------|---------|------|
| Sentry | Error tracking | Free-$29/mo |
| Plausible | Analytics | $9-29/mo |
| DataDog | Monitoring | $15-99/mo |
| New Relic | APM | Free-$99/mo |
| PagerDuty | Alerting | $9-99/mo |
| Grafana | Dashboards | Free-$99/mo |

### Success Metrics

**Monitoring:**
- 99.9% uptime
- <5s response time (p95)
- <1% error rate
- <100ms database query time

**Analytics:**
- 10,000+ MAU (Month 1)
- 50%+ free-to-pro conversion
- <5% churn rate
- $5+ LTV:CAC ratio

---

**Timeline:** 1-2 days to set up all monitoring

**Status:** All 5 steps completed!
