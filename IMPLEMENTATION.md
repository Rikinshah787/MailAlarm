# Implementation Guide

This document provides detailed technical implementation details for EmailGuard.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         EmailGuard                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Gmail     │    │   Express   │    │   Twilio    │         │
│  │   IMAP      │───▶│   Server    │───▶│   API       │         │
│  │   Polling   │    │   (API)     │    │   (Calls)   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              State Manager (JSON File)               │       │
│  │  - Notification status (active/stopped)              │       │
│  │  - Call logs                                         │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Email Monitor (`src/emailMonitor.js`)

Responsible for connecting to Gmail via IMAP and detecting new emails.

**Key Functions:**
- `connect()` - Establishes IMAP connection
- `checkNewEmails()` - Polls for new messages
- `startPolling(intervalSeconds)` - Starts the polling loop
- `extractEmail(headerValue)` - Parses email addresses from headers

**Flow:**
1. Connect to IMAP server with TLS
2. Open INBOX
3. Get latest UID to establish baseline
4. Every 30 seconds, search for emails with UID > lastSeenUID
5. For each new email, check if sender matches TARGET_SENDERS
6. If match found and notifications enabled, trigger phone call

### 2. Phone Service (`src/phoneService.js`)

Handles Twilio integration for making phone calls.

**Key Functions:**
- `initTwilio()` - Initializes Twilio client
- `makeCall(senderEmail, subject)` - Makes a single call with TwiML
- `startCallLoop(senderEmail, subject)` - Starts repeating calls
- `stopCallLoop()` - Stops the call loop
- `generateCallTwiML()` - Generates TwiML with Gather for keypad input

**TwiML Structure:**
```xml
<Response>
  <Say>Important email from [sender]. Subject: [subject].</Say>
  <Gather input="dtmf" numDigits="3" action="/twilio-gather">
    <Say>Press 1-9-9 to stop these calls.</Say>
  </Gather>
</Response>
```

### 3. State Manager (`src/stateManager.js`)

Manages persistent state using a JSON file.

**State Structure:**
```json
{
  "isStopped": false,
  "stoppedAt": null,
  "startedAt": "2024-01-01T00:00:00.000Z",
  "callLogs": [
    {
      "senderEmail": "boss@company.com",
      "subject": "Urgent Meeting",
      "callSid": "CAxxxxxxxxxx",
      "calledAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 4. API Server (`src/api.js`)

Express server providing REST endpoints and web UI.

**Endpoints:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Serve web UI |
| `/stop` | POST | Stop notifications with code 199 |
| `/start` | POST | Re-enable notifications |
| `/status` | GET | Get current status |
| `/logs` | GET | Get recent call logs |
| `/test-call` | POST | Trigger test call |
| `/simulate-email` | POST | Simulate email for testing |
| `/twilio-gather` | POST | Handle phone keypad input |

### 5. Config (`src/config.js`)

Centralized configuration from environment variables.

**Environment Variables:**
- `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASSWORD` - Email connection
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `YOUR_PHONE_NUMBER` - Twilio
- `TARGET_SENDERS` - Comma-separated list of email addresses to monitor
- `STOP_CODE` - Code to stop (default: 199)
- `CALL_INTERVAL_SECONDS` - Seconds between calls (default: 30)
- `POLL_INTERVAL_SECONDS` - Seconds between email checks (default: 30)
- `APP_URL` - Public URL for Twilio webhooks

## Security Considerations

### Credentials
- Never commit `.env` file (it's in `.gitignore`)
- Use Gmail App Passwords instead of real passwords
- Twilio credentials should be kept secret

### Twilio Webhook Security
For production, validate that requests to `/twilio-gather` come from Twilio:
```javascript
const twilio = require('twilio');
const validateRequest = twilio.validateRequest(
  authToken,
  req.headers['x-twilio-signature'],
  url,
  req.body
);
```

### Rate Limiting
Consider adding rate limiting to prevent abuse of the stop endpoint.

## Deployment

### Railway
1. Push to GitHub
2. Connect Railway to your repo
3. Add environment variables
4. Deploy automatically

### Docker (Alternative)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Extending EmailGuard

### Adding SMS Support
Modify `phoneService.js` to use Twilio's SMS API alongside calls.

### Adding Slack/Discord Notifications
Create a new service module that posts to webhooks.

### Supporting Other Email Providers
Modify `emailMonitor.js` to support different IMAP servers or use provider-specific APIs (Microsoft Graph, etc.).

## Troubleshooting

### Email not detected
1. Check IMAP credentials are correct
2. Verify TARGET_SENDERS matches the sender's email exactly
3. Check server logs for "📨 New email detected!"

### Phone not ringing
1. Verify Twilio credentials
2. Check YOUR_PHONE_NUMBER is verified in Twilio (required for trial)
3. Check server logs for "📞 Call initiated:"

### Keypad 199 not working
1. Ensure APP_URL is set to your public URL
2. Twilio must be able to reach your server
3. Check server logs for "📱 Phone keypad input received:"
