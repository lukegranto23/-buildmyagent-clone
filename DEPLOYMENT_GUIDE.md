# Deployment Guide - Main Street Agent Lab

## Quick Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Prerequisites:**
- GitHub account
- Vercel account (free tier available)

**Steps:**
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "New Project" and import your GitHub repository

4. Configure environment variables in Vercel:
   - Go to Settings → Environment Variables
   - Add all variables from `.env.example`
   - Make sure to use production values!

5. Deploy:
   - Vercel will automatically deploy
   - Your app will be live at `https://your-app.vercel.app`

**Database Setup for Vercel:**
```bash
# Switch to PostgreSQL for production
# Update DATABASE_URL in Vercel settings to:
# postgresql://user:password@host:5432/database
```

**Important Vercel Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: 18.x or higher

---

### Option 2: Railway (With Database Included)

**Prerequisites:**
- GitHub account
- Railway account

**Steps:**
1. Go to [railway.app](https://railway.app)

2. Create new project from GitHub repo

3. Add PostgreSQL plugin:
   - Click "+ New"
   - Select "Database"
   - Choose "PostgreSQL"

4. Configure environment variables:
   - Click on your service
   - Go to Variables tab
   - Add all variables from `.env.example`
   - Use the PostgreSQL connection string from Railway

5. Update Prisma schema:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from sqlite
     url      = env("DATABASE_URL")
   }
   ```

6. Run migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```

---

### Option 3: Docker (Self-Hosted)

**Create `Dockerfile`:**
```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/agentlab
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=agentlab
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Deploy:**
```bash
docker-compose up -d
```

---

## Environment Variables Setup

### Required Variables
```bash
# Generate a secure secret:
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://your-domain.com

# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"
```

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-domain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for dev)
6. Copy Client ID and Secret to environment variables

### Stripe Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from Developers → API Keys
3. Set up webhook endpoint:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
   - Copy webhook secret

### Email Server Setup (Optional)

**Option A: SendGrid**
```bash
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM=noreply@yourdomain.com
```

**Option B: AWS SES**
```bash
EMAIL_SERVER_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=<your-smtp-username>
EMAIL_SERVER_PASSWORD=<your-smtp-password>
EMAIL_FROM=noreply@yourdomain.com
```

---

## Database Migration

### From SQLite to PostgreSQL

1. **Update Prisma schema:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Create migration:**
   ```bash
   npx prisma migrate dev --name switch_to_postgresql
   ```

3. **Deploy to production:**
   ```bash
   npx prisma migrate deploy
   ```

---

## SSL/HTTPS Setup

### Using Cloudflare (Easiest)
1. Add your domain to Cloudflare
2. Update DNS to point to your server
3. Enable "Always Use HTTPS"
4. Enable "Auto HTTPS Rewrites"

### Using Let's Encrypt + Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Performance Optimization

### 1. Enable Caching
Add to `next.config.mjs`:
```javascript
const nextConfig = {
  compress: true,
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
  },
};
```

### 2. Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_agent_created_at ON "Agent"("createdAt" DESC);
CREATE INDEX idx_session_agent_created ON "ConversationSession"("agentId", "createdAt" DESC);
CREATE INDEX idx_workflow_status ON "Workflow"("status", "updatedAt" DESC);
```

### 3. CDN Setup
- Use Cloudflare or AWS CloudFront
- Cache static assets
- Enable compression

---

## Monitoring & Logging

### Option 1: Sentry
```bash
npm install @sentry/nextjs

# Add to next.config.js
withSentryConfig(nextConfig, {
  org: "your-org",
  project: "your-project",
});
```

### Option 2: LogRocket
```bash
npm install logrocket

# Initialize in _app.tsx
LogRocket.init('your-app-id');
```

---

## Backup Strategy

### Database Backups
```bash
# PostgreSQL backup (daily cron)
0 2 * * * pg_dump -U user database > /backups/db_$(date +\%Y\%m\%d).sql

# Keep last 30 days
find /backups -type f -mtime +30 -delete
```

### File Backups
```bash
# Backup .env and important files
0 3 * * * tar -czf /backups/config_$(date +\%Y\%m\%d).tar.gz /app/.env /app/public
```

---

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set secure `NEXTAUTH_SECRET`
- [ ] Enable CSRF protection (NextAuth default)
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable database SSL connections
- [ ] Set up firewall rules
- [ ] Use strong PostgreSQL password
- [ ] Enable 2FA for admin accounts
- [ ] Regular security updates
- [ ] Monitor error logs
- [ ] Set up DDoS protection

---

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Reset if needed (CAUTION: deletes data)
npx prisma migrate reset
```

### Environment Variable Issues
- Check for typos in variable names
- Ensure no quotes around values in .env
- Restart app after changes
- Check Vercel/Railway logs

---

## Post-Deployment

### 1. Test Everything
- [ ] Sign in with email
- [ ] Sign in with Google
- [ ] Create an agent
- [ ] Test sandbox
- [ ] Create workflow
- [ ] Test Stripe checkout (test mode)
- [ ] Verify webhooks working

### 2. Set Up Monitoring
- Enable Vercel Analytics
- Set up Sentry error tracking
- Configure uptime monitoring (UptimeRobot)

### 3. Configure DNS
- Point your domain to deployment
- Set up email DNS records (SPF, DKIM)
- Enable DNSSEC

### 4. Launch Checklist
- [ ] All environment variables set
- [ ] Database backed up
- [ ] SSL certificate valid
- [ ] Webhooks configured
- [ ] Email delivery tested
- [ ] Error monitoring active
- [ ] Documentation updated
- [ ] Team onboarded

---

## Support

If you encounter issues:
1. Check logs in your deployment platform
2. Review the error in browser console
3. Check database connectivity
4. Verify environment variables
5. Review the IMPLEMENTATION_SUMMARY.md for architecture details

## Next Steps After Deployment

1. Set up a custom domain
2. Configure email templates
3. Add analytics (Google Analytics, PostHog)
4. Set up status page
5. Create admin dashboard
6. Implement usage limits
7. Add email notifications
8. Set up support system (Intercom, Zendesk)

---

**Deployment Time Estimate:**
- Vercel: 10-15 minutes
- Railway: 15-20 minutes
- Docker Self-Hosted: 30-45 minutes

Good luck with your deployment! 🚀
