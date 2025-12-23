# 🔔 MailAlarm

### *"Get called when it matters."*

> Tired of missing important emails? Waiting anxiously for that critical response? **MailAlarm** calls your phone when emails from specific senders arrive — and keeps calling until you acknowledge.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Open Source](https://img.shields.io/badge/Open%20Source-❤️-red.svg)](https://github.com)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

---

## 🎯 The Problem

You're expecting an important email from your boss, a client, or an automated alert system. You step away from your computer. The email arrives. Hours pass before you notice.

## 💡 The Solution

**MailAlarm** monitors your inbox and **calls your phone repeatedly** when emails arrive from senders you specify. The calls continue every 30 seconds until you press **199** on your phone keypad or web interface.

**Never miss what matters again.**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📞 **Real Phone Calls** | Actual calls to your phone via Twilio |
| 🔁 **Persistent Notifications** | Calls repeat every 30 seconds until you respond |
| 📱 **Phone Keypad Stop** | Press 199 on your phone to acknowledge |
| 🌐 **Web Dashboard** | Beautiful UI to monitor and control |
| 📧 **Multi-Sender Monitoring** | Watch multiple important email addresses |
| ☁️ **Cloud Ready** | Deploy to Railway, Render, or any Node.js host |
| 🔓 **Open Source** | Free forever, community-driven |

---

## 🚀 Quick Start

### What You Need

- Node.js 18+
- Gmail account (personal or Google Workspace)
- Twilio account ([free trial with $15 credit](https://www.twilio.com/try-twilio))

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/mailalarm.git
cd mailalarm
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Your Gmail
IMAP_HOST=imap.gmail.com
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-16-char-app-password

# Twilio (get from twilio.com/console)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
YOUR_PHONE_NUMBER=+1234567890

# Who should trigger calls? (comma-separated)
TARGET_SENDERS=boss@company.com,alerts@service.com
```

### 3. Run

```bash
npm start
```

Open **http://localhost:3000** 🎉

---

## 📞 How It Works

```
┌─────────────────────────────────────────────────┐
│                                                  │
│   📧 Email arrives from important sender         │
│                     ↓                            │
│   🔍 MailAlarm detects it (checks every 30s)    │
│                     ↓                            │
│   📞 Your phone rings!                           │
│      "Important email from [sender]..."          │
│      "Press 1-9-9 to stop these calls"          │
│                     ↓                            │
│   🔁 Calls repeat every 30 seconds              │
│                     ↓                            │
│   ✅ You press 199 → Calls stop                 │
│                     ↓                            │
│   🔄 Next important email → Starts again        │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🔐 Setup Guides

### Gmail App Password

1. Enable 2-Step Verification: [myaccount.google.com/security](https://myaccount.google.com/security)
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows"
4. Copy the 16-character password (no spaces)

### Twilio Setup

1. Sign up: [twilio.com/try-twilio](https://www.twilio.com/try-twilio) (free $15 credit)
2. Get your Account SID and Auth Token from the console
3. Get a phone number
4. **Important**: Add your personal number to "Verified Caller IDs" (required for trial)

---

## ☁️ Deploy to Cloud

### Railway (Recommended)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create project → Deploy from GitHub
4. Add your environment variables
5. Set `APP_URL` to your Railway URL (for phone keypad to work)

---

## 🔧 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web dashboard |
| `/status` | GET | System status & config |
| `/stop` | POST | Stop calls with `{"code": "199"}` |
| `/start` | POST | Re-enable notifications |
| `/logs` | GET | Recent call history |
| `/test-call` | POST | Trigger a test call |
| `/simulate-email` | POST | Simulate email for testing |

---

## 📁 Project Structure

```
mailalarm/
├── src/
│   ├── index.js           # Application entry
│   ├── config.js          # Environment config
│   ├── api.js             # Express routes
│   ├── emailMonitor.js    # IMAP email polling
│   ├── phoneService.js    # Twilio integration
│   ├── stateManager.js    # Persistence layer
│   └── public/
│       └── index.html     # Web dashboard
├── .env.example
├── package.json
├── railway.toml
├── LICENSE
├── CONTRIBUTING.md
├── IMPLEMENTATION.md
└── README.md
```

---

## 🤝 Contributing

We love contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Fork, clone, then:
git checkout -b feature/amazing-feature
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
# Open a Pull Request
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙏 Credits

- [Twilio](https://www.twilio.com/) - Phone call API
- [imap-simple](https://www.npmjs.com/package/imap-simple) - IMAP integration

---

<p align="center">
  <b>⭐ Star this repo if MailAlarm helps you never miss important emails! ⭐</b>
</p>

<p align="center">
  Made with ❤️ for people who can't afford to miss what matters
</p>
