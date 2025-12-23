# 📧 EmailGuard - Never Miss Critical Emails

> **Get persistent phone calls when important emails arrive. Stop them by pressing 199 on your phone or web.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

---

## 🎯 Problem

You're waiting for a critical email from your boss, client, or an important alert. You step away from your computer. The email arrives. You miss it for hours.

## 💡 Solution

**EmailGuard** monitors your inbox and **calls your phone repeatedly** when emails arrive from specific senders. The calls continue every 30 seconds until you acknowledge by pressing **199** on your phone keypad or web interface.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📱 **Phone Calls** | Receive actual phone calls via Twilio |
| 🔁 **Persistent Alerts** | Calls repeat every 30 seconds until acknowledged |
| 📞 **Phone Keypad Stop** | Press 199 on your phone to stop calls |
| 🌐 **Web Interface** | Beautiful UI to monitor status and stop calls |
| 📧 **Multi-Sender Support** | Monitor multiple email addresses |
| ☁️ **Cloud Ready** | Deploy to Railway, Render, or any Node.js host |
| 🔒 **Secure** | App passwords, no plain credentials stored |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Gmail account (personal or Google Workspace)
- Twilio account (free trial available)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/emailguard.git
cd emailguard
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Gmail IMAP
IMAP_HOST=imap.gmail.com
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-16-char-app-password

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
YOUR_PHONE_NUMBER=+1234567890

# Email addresses to monitor (comma-separated)
TARGET_SENDERS=boss@company.com,alerts@important.com

# For phone keypad to work (set to your deployed URL)
APP_URL=https://your-app.railway.app
```

### 3. Run

```bash
npm start
```

Open **http://localhost:3000** to see the web interface.

---

## 📞 How It Works

```
1. EmailGuard connects to your inbox via IMAP
         ↓
2. Polls for new emails every 30 seconds
         ↓
3. Email from TARGET_SENDER detected
         ↓
4. 📞 Your phone rings with message:
   "Important email from [sender]. Press 1-9-9 to stop."
         ↓
5. Calls repeat every 30 seconds
         ↓
6. Press 199 on phone OR web → Calls stop
         ↓
7. Next important email → Cycle repeats
```

---

## 🔐 Gmail App Password Setup

1. Enable 2-Step Verification at [myaccount.google.com/security](https://myaccount.google.com/security)
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate password for "Mail" on "Windows"
4. Copy the 16-character password (remove spaces)
5. Use this as `IMAP_PASSWORD`

---

## 📱 Twilio Setup

1. Sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio) (free $15 credit)
2. Get your **Account SID** and **Auth Token** from the console
3. Get a phone number from the console
4. **Important**: Add your personal number to "Verified Caller IDs" (required for trial)

---

## ☁️ Deploy to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and create a new project
3. Select "Deploy from GitHub repo"
4. Add environment variables (same as `.env`)
5. Get your public URL and set it as `APP_URL`

The phone keypad feature (pressing 199) requires a public URL that Twilio can reach.

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web interface |
| `/status` | GET | Current system status |
| `/stop` | POST | Stop calls (body: `{"code": "199"}`) |
| `/start` | POST | Re-enable notifications |
| `/logs` | GET | Recent call history |
| `/test-call` | POST | Trigger a test call |
| `/simulate-email` | POST | Simulate email arrival |
| `/twilio-gather` | POST | Twilio webhook for keypad input |

---

## 📁 Project Structure

```
emailguard/
├── src/
│   ├── index.js           # Entry point
│   ├── config.js          # Environment configuration
│   ├── api.js             # Express server & routes
│   ├── emailMonitor.js    # IMAP email polling
│   ├── phoneService.js    # Twilio phone calls
│   ├── stateManager.js    # State persistence
│   ├── emailWebhook.js    # Email processing logic
│   └── public/
│       └── index.html     # Web UI
├── .env.example           # Environment template
├── package.json
├── railway.toml           # Railway deployment config
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Twilio](https://www.twilio.com/) for phone call API
- [imap-simple](https://www.npmjs.com/package/imap-simple) for IMAP integration
- Built with ❤️ for people who can't afford to miss important emails

---

## ⭐ Star History

If this project helps you, please consider giving it a star! ⭐
