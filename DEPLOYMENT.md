# Deployment Guide

This guide will help you deploy your BuildMyAgent clone to production.

## Prerequisites

- Node.js 18+ installed
- A PostgreSQL database (or SQLite for development)
- Twilio account (for voice/SMS features)
- OpenAI API key (for AI agent conversations)
- Stripe account (optional, for payment processing)
- Google OAuth credentials (optional, for authentication)

## Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-domain.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="postgresql://username:password@host:5432/dbname"
# Or for SQLite in development:
# DATABASE_URL="file:./dev.db"

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_DEFAULT_CALLER_ID=+1234567890

# Stripe (optional)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

## Database Setup

### PostgreSQL (Production)

1. Create a PostgreSQL database
2. Update `DATABASE_URL` in `.env` with your database connection string
3. Run migrations:

```bash
npx prisma migrate deploy
```

### SQLite (Development)

SQLite is great for local development but not recommended for production.

```bash
npx prisma generate
npx prisma migrate deploy
```

## Deployment Platforms

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/buildmyagent-clone.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure environment variables (copy from `.env`)
   - Deploy!

3. **Configure Database**
   - Use Vercel Postgres or connect to an external PostgreSQL database
   - Update `DATABASE_URL` in Vercel environment variables
   - Redeploy to apply database connection

4. **Run Migrations**
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

### Netlify

1. **Build Configuration**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   - Add all environment variables from `.env` in Netlify dashboard

3. **Database**
   - Use a hosted PostgreSQL service (e.g., Supabase, Neon, Railway)
   - Update `DATABASE_URL` environment variable

### Railway

1. **Deploy from GitHub**
   - Connect your GitHub repository
   - Railway will auto-detect Next.js and configure build settings

2. **Add PostgreSQL**
   - Add PostgreSQL plugin from Railway dashboard
   - Railway automatically sets `DATABASE_URL`

3. **Run Migrations**
   ```bash
   railway run npx prisma migrate deploy
   ```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t buildmyagent .
docker run -p 3000:3000 --env-file .env buildmyagent
```

## Post-Deployment Setup

### 1. Configure Twilio Webhooks

In your Twilio console:

**Voice Webhook:**
- URL: `https://your-domain.com/api/runtime/twilio/voice?agentId=AGENT_ID`
- Method: POST
- Content-Type: application/x-www-form-urlencoded

**SMS Webhook:**
- URL: `https://your-domain.com/api/runtime/twilio/sms?agentId=AGENT_ID`
- Method: POST
- Content-Type: application/x-www-form-urlencoded

Replace `AGENT_ID` with actual agent IDs from your agent library.

### 2. Set Up Agent Calendar

For each agent that needs appointment booking:

```bash
curl -X POST https://your-domain.com/api/agents/AGENT_ID/calendar \
  -H "Content-Type: application/json" \
  -d '{
    "timezone": "America/Chicago",
    "meetingDuration": 30,
    "bufferBefore": 10,
    "bufferAfter": 10,
    "availability": [
      { "day": 1, "windows": [{ "start": "09:00", "end": "17:00" }] },
      { "day": 2, "windows": [{ "start": "09:00", "end": "17:00" }] },
      { "day": 3, "windows": [{ "start": "09:00", "end": "17:00" }] },
      { "day": 4, "windows": [{ "start": "09:00", "end": "17:00" }] },
      { "day": 5, "windows": [{ "start": "09:00", "end": "15:00" }] }
    ]
  }'
```

### 3. Test Your Deployment

1. **Create an Agent**
   - Visit `https://your-domain.com`
   - Use the agent builder to create a test agent

2. **Test Sandbox**
   - Navigate to `/agents/{agentId}/sandbox`
   - Send test messages to verify AI responses

3. **Test Twilio Integration**
   - Call or text your Twilio number
   - Verify conversation logging in dashboard

4. **Test Appointment Booking**
   - Request an appointment via voice or SMS
   - Check `/dashboard` for scheduled appointments

### 4. Monitor Your Application

- **Logs**: Check Vercel/Railway logs for errors
- **Dashboard**: Monitor conversations at `/dashboard`
- **Database**: Use Prisma Studio to inspect data
  ```bash
  npx prisma studio
  ```

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db push

# View database in browser
npx prisma studio
```

### Twilio Webhook Errors

- Ensure webhooks use POST method
- Verify `agentId` query parameter is correct
- Check Twilio debugger for detailed error logs

### OpenAI API Errors

- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits
- Review rate limits if requests fail

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` to git
   - Use different secrets for production
   - Rotate API keys regularly

2. **Database**
   - Enable SSL connections for PostgreSQL
   - Use connection pooling (e.g., PgBouncer)
   - Regular backups

3. **API Keys**
   - Restrict API key permissions
   - Monitor usage and set alerts
   - Use separate keys for dev/staging/prod

4. **Authentication**
   - Enable Google OAuth for production
   - Implement rate limiting
   - Add CORS protection for APIs

## Scaling Considerations

### Database

- Use PostgreSQL with connection pooling
- Consider read replicas for heavy traffic
- Implement database indexing for performance

### Caching

- Enable Next.js caching strategies
- Use Redis for session storage
- Cache API responses where appropriate

### CDN

- Use Vercel Edge Network or Cloudflare
- Optimize images with Next.js Image component
- Enable gzip/brotli compression

## Monitoring and Observability

### Recommended Tools

- **Error Tracking**: Sentry
- **Analytics**: PostHog, Mixpanel
- **Logs**: Logtail, Datadog
- **Uptime**: UptimeRobot, Pingdom

### Health Checks

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

## Support

For issues or questions:
- Check GitHub Issues
- Review Next.js documentation
- Consult Prisma guides
- Contact Twilio support for telephony issues

## License

This project is for personal/educational use. See LICENSE file for details.
