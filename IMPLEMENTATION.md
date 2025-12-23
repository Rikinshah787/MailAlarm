# Implementation Guide

Technical documentation for **MailAlarm** — *"Get called when it matters."*

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                          MailAlarm                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│  │    Gmail     │   │   Express    │   │   Twilio     │         │
│  │    IMAP      │──▶│   Server     │──▶│   Phone      │         │
│  │   Monitor    │   │   + API      │   │   Calls      │         │
│  └──────────────┘   └──────────────┘   └──────────────┘         │
│         │                  │                   │                 │
│         │                  ▼                   │                 │
│         │        ┌──────────────┐              │                 │
│         │        │   Web UI     │              │                 │
│         │        │  Dashboard   │              │                 │
│         │        └──────────────┘              │                 │
│         │                                      │                 │
│         ▼                  ▼                   ▼                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              State Manager (JSON Persistence)           │     │
│  │  • Notification status (active/stopped)                 │     │
│  │  • Call history logs                                    │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Email Monitor (`src/emailMonitor.js`)

**Purpose:** Connect to Gmail via IMAP and detect new emails from target senders.

**Key Functions:**
| Function | Description |
|----------|-------------|
| `connect()` | Establish IMAP connection with TLS |
| `checkNewEmails()` | Poll for new messages |
| `startPolling(interval)` | Begin the polling loop |
| `extractEmail(header)` | Parse sender email from headers |

**Flow:**
1. Connect to IMAP server (`imap.gmail.com:993`)
2. Open INBOX folder
3. Get latest message UID as baseline
4. Every 30 seconds, search for emails with UID > lastSeenUID
5. For each new email, check if sender matches `TARGET_SENDERS`
6. If match && notifications enabled → trigger phone call loop

---

### 2. Phone Service (`src/phoneService.js`)

**Purpose:** Make phone calls via Twilio with keypad input support.

**Key Functions:**
| Function | Description |
|----------|-------------|
| `initTwilio()` | Initialize Twilio client |
| `makeCall(sender, subject)` | Make single call with TwiML |
| `startCallLoop(sender, subject)` | Start repeating call loop |
| `stopCallLoop()` | Stop the loop |
| `generateCallTwiML()` | Generate TwiML with Gather |

**TwiML Example:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Important email from boss@company.com.</Say>
  <Say voice="alice">Subject: Urgent Meeting.</Say>
  <Gather input="dtmf" numDigits="3" action="/twilio-gather">
    <Say voice="alice">Press 1-9-9 to stop these calls.</Say>
  </Gather>
</Response>
```

---

### 3. State Manager (`src/stateManager.js`)

**Purpose:** Persist notification state and call logs using JSON file.

**Data Structure:**
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
      "calledAt": "2024-01-01T12:30:00.000Z"
    }
  ]
}
```

---

### 4. API Server (`src/api.js`)

**Purpose:** Express server for REST API and web dashboard.

**Routes:**
| Route | Method | Handler |
|-------|--------|---------|
| `/` | GET | Serve web dashboard |
| `/stop` | POST | Stop with code 199 |
| `/start` | POST | Re-enable notifications |
| `/status` | GET | Current system status |
| `/logs` | GET | Recent call logs |
| `/test-call` | POST | Trigger test call |
| `/simulate-email` | POST | Simulate email arrival |
| `/twilio-gather` | POST | Handle phone keypad input |

---

### 5. Config (`src/config.js`)

**Environment Variables:**

| Variable | Required | Description |
|----------|----------|-------------|
| `IMAP_HOST` | Yes | Email server (e.g., `imap.gmail.com`) |
| `IMAP_PORT` | No | Default: `993` |
| `IMAP_USER` | Yes | Your email address |
| `IMAP_PASSWORD` | Yes | App password |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Yes | Twilio phone number |
| `YOUR_PHONE_NUMBER` | Yes | Your phone to receive calls |
| `TARGET_SENDERS` | Yes | Comma-separated emails to monitor |
| `STOP_CODE` | No | Default: `199` |
| `CALL_INTERVAL_SECONDS` | No | Default: `30` |
| `POLL_INTERVAL_SECONDS` | No | Default: `30` |
| `APP_URL` | For cloud | Public URL for Twilio webhooks |

---

## Security

### Credentials Protection
- `.env` file is gitignored — never committed
- Use Gmail App Passwords, not real passwords
- Twilio credentials kept secret

### Twilio Webhook Validation (Production)
```javascript
const twilio = require('twilio');

// Validate webhook requests
const isValid = twilio.validateRequest(
  authToken,
  req.headers['x-twilio-signature'],
  fullUrl,
  req.body
);
```

---

## Deployment

### Railway
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/status"
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Extending MailAlarm

### Add SMS Notifications
```javascript
// In phoneService.js
async function sendSMS(message) {
  await client.messages.create({
    body: message,
    to: config.twilio.yourPhoneNumber,
    from: config.twilio.phoneNumber
  });
}
```

### Add Slack/Discord
Create webhook integration to post to channels.

### Support Microsoft Outlook
Use Microsoft Graph API instead of IMAP for Office 365 accounts.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not detected | Check TARGET_SENDERS matches sender exactly |
| Phone not ringing | Verify phone is in Twilio Verified Caller IDs |
| Keypad 199 not working | Set APP_URL to your public server URL |
| IMAP connection fails | Check app password is correct (no spaces) |
