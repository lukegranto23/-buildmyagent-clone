# 🚀 Quick Start Guide

## Your App is Running!

The development server should now be running. Here's what you can do:

### 1. **Open Your Browser**
   - Go to: **http://localhost:3000**
   - You should see the main page with the agent builder

### 2. **Create Your First Agent**
   - On the homepage, you'll see a wizard-style builder
   - Select an industry (e.g., "Dental & Orthodontic Offices")
   - Choose a role (e.g., "Appointment Coordinator")
   - Pick a tone (e.g., "Warm & Professional")
   - Customize the agent name and offer name
   - Click "Launch" to create and save

### 3. **View Your Agents**
   - Click "Agents" in the navigation (or go to `/agents`)
   - See all your created agents
   - Click "Test in sandbox" to test any agent

### 4. **Test an Agent**
   - In the sandbox, try asking questions like:
     - "I need to schedule a cleaning"
     - "Do you take insurance?"
     - "What are your hours?"
   - The agent will respond using AI (or fallback if no OpenAI key)

### 5. **View Dashboard**
   - Click "Dashboard" in the navigation (or go to `/dashboard`)
   - See all conversations, appointments, and stats
   - Click any conversation to view full transcripts

### 6. **Set Up Calendar (Optional)**
   - Use the API to set availability:
   ```bash
   curl -X POST http://localhost:3000/api/agents/YOUR_AGENT_ID/calendar \
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

### 7. **Set Up Twilio (Optional)**
   - If you have Twilio credentials, add them to `.env`
   - Configure webhooks in Twilio Console to point to your server
   - Voice: `/api/runtime/twilio/voice?agentId=YOUR_AGENT_ID`
   - SMS: `/api/runtime/twilio/sms?agentId=YOUR_AGENT_ID`

## What's Working Right Now

✅ **Agent Builder** - Create agents with industry templates  
✅ **Agent Library** - View and manage all agents  
✅ **Sandbox Testing** - Test agents before deployment  
✅ **Operations Dashboard** - Monitor conversations and appointments  
✅ **Calendar Booking** - Auto-schedule appointments when customers ask  
✅ **Database** - All data saved to SQLite (`dev.db`)  
✅ **Conversation Logging** - All chats saved for review  

## Next Steps (When Ready)

- Add OpenAI API key to `.env` for better AI responses
- Configure Twilio for voice/SMS
- Set up Google Calendar sync
- Add CRM integrations (ServiceTitan, HubSpot)

## Troubleshooting

**Server not starting?**
- Make sure port 3000 is free
- Check if Node.js is installed: `node -v`
- Try: `npm install` then `npm run dev`

**Can't see agents?**
- Check the database exists: `prisma/dev.db`
- Run migrations: `npx prisma migrate deploy`

**Need help?**
- All API endpoints are in `/app/api/`
- Database schema is in `/prisma/schema.prisma`
- Logs are in the terminal where you ran `npm run dev`

---

**Your app is ready to use! 🎉**

