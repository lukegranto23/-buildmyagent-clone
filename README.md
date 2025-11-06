# BuildMyAgent Clone

A fully functional clone of buildmyagent.io - an AI agent builder platform for creating and selling AI agents to businesses.

## Features

- 🎯 **Agent Builder**: Create AI agents with natural language descriptions or templates
- 📦 **Templates**: Pre-built templates for common business use cases
- 🔌 **Integrations**: Connect with 800+ apps (Gmail, Calendly, Slack, HubSpot, etc.)
- 💳 **Pricing System**: Credit-based pricing with multiple tiers
- 🧪 **Sandbox Testing**: Chat with any agent before launch, powered by OpenAI or a built-in fallback
- 📞 **Voice & SMS**: Twilio integration for phone and text conversations
- 📅 **Calendar Booking**: Automatic appointment scheduling with availability management
- 📊 **Operations Dashboard**: Real-time view of conversations, appointments, and agent performance
- 🎨 **Modern UI**: Clean, responsive design built with Next.js and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js (to be configured)
- **Database**: Prisma + SQLite (local development)
- **Payments**: Stripe (to be configured)
- **AI**: OpenAI API (to be configured)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd buildmyagent-clone
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
- `NEXTAUTH_SECRET`: Random secret for NextAuth
- `NEXTAUTH_URL`: Your app URL (e.g., http://localhost:3000)
- `EMAIL_FROM`: Address shown on magic link emails (e.g., login@mainstreet.dev)
- `EMAIL_SERVER`: (Optional) SMTP connection string for sending magic links (omit to log links to the console in development)
- `DATABASE_URL`: Your database connection string
- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: (Optional) Defaults to `gpt-4o-mini`
- `TWILIO_ACCOUNT_SID`: Twilio project SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_DEFAULT_CALLER_ID`: (Optional) Number to use for outbound tests

If you skip the OpenAI keys the sandbox will still respond using a built-in fallback copy engine.
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

4. Set up the database (creates a local `dev.db` SQLite file):
```bash
npx prisma migrate dev --name init
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Configure Twilio (Voice & SMS)

1. In the Twilio Console, provision a phone number.
2. Set the **Voice** webhook URL to `https://your-domain/api/runtime/twilio/voice?agentId=AGENT_ID`.
3. Set the **Messaging** webhook URL to `https://your-domain/api/runtime/twilio/sms?agentId=AGENT_ID`.
4. Replace `AGENT_ID` with the ID from the agent library page (`/agents`).
5. Ensure the webhook HTTP method is **POST** and Content-Type is `application/x-www-form-urlencoded` (Twilio default).

Incoming calls and texts will now be routed through the agent runtime, with transcripts logged in the conversation history.

### Configure Calendar Availability

1. Call the calendar config endpoint with your preferred hours (example below uses Monday–Friday 9–5 Central):
   ```bash
   curl -X POST http://localhost:3000/api/agents/AGENT_ID/calendar \
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
2. The runtime will now auto-book the next open slot when callers or texters ask to “book an appointment” or “schedule service”.
3. Fetch upcoming appointments at any time:
   ```bash
   curl http://localhost:3000/api/agents/AGENT_ID/appointments?status=scheduled
   ```

### Operations Dashboard

Visit `/dashboard` to view:
- **Real-time stats**: Total sessions, active conversations, completed interactions, scheduled appointments
- **Recent conversations**: Browse all agent interactions with full transcripts
- **Upcoming appointments**: See all scheduled bookings with customer contact info
- **Session details**: Click any conversation to view the full transcript and outcome

The dashboard automatically refreshes data and provides a centralized view of all agent activity across voice, SMS, and sandbox channels.

### Testing an Agent

1. Create an agent from the homepage builder or use an existing one in `/agents`.
2. Click **Test in sandbox** on the agent card, or navigate to `/agents/{agentId}/sandbox`.
3. Enter prospect-style questions to role-play; responses use OpenAI when configured or the fallback copy otherwise.

## Project Structure

```
buildmyagent-clone/
├── app/
│   ├── agents/          # Agent management pages
│   ├── auth/            # Authentication pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/
│   ├── ui/              # Reusable UI components
│   ├── AgentBuilder.tsx # Main agent builder component
│   ├── Integrations.tsx # Integrations showcase
│   ├── Pricing.tsx      # Pricing section
│   └── ...              # Other components
├── prisma/
│   └── schema.prisma    # Database schema
└── public/              # Static assets
```

## Features to Implement

- [ ] Complete authentication flow (NextAuth)
- [ ] Database integration (Prisma)
- [ ] OpenAI agent execution
- [ ] Stripe payment integration
- [ ] Agent testing and preview
- [ ] Integration connections
- [ ] Agent marketplace
- [ ] Sub-account management
- [ ] Credit system
- [ ] Demo builder

## Contributing

This is a personal project, but feel free to fork and modify for your own use.

## License

This project is for personal use only. The original buildmyagent.io is a commercial product.

