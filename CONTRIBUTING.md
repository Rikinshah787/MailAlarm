# Contributing to MailAlarm

*"Get called when it matters."*

Thank you for considering contributing to MailAlarm! We welcome contributions from everyone.

## How to Contribute

### 🐛 Reporting Bugs

1. Check if the bug has already been reported in [Issues](../../issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (Node version, OS, etc.)

### 💡 Suggesting Features

1. Open an issue with the "Feature Request" label
2. Describe the feature and its use case
3. Explain why it would benefit MailAlarm users

### 🔧 Pull Requests

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make your changes
4. Test thoroughly
5. Commit with clear messages:
   ```bash
   git commit -m "Add: amazing feature description"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
7. Open a Pull Request

### 📝 Code Style

- Use 2-space indentation
- Use meaningful variable names
- Add comments for complex logic
- Follow existing patterns in the codebase
- Keep functions focused and small

### ✅ Testing Checklist

Before submitting a PR, verify:

- [ ] `npm start` runs without errors
- [ ] Email detection works (`/simulate-email` endpoint)
- [ ] Phone calls work (`/test-call` endpoint)
- [ ] Web dashboard loads and functions
- [ ] Stop code 199 works (web and phone)

## Development Setup

```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/mailalarm.git
cd mailalarm

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your credentials

# 4. Run locally
npm start
```

## Ideas for Contributions

- 📱 SMS notification support
- 💬 Slack/Discord integration
- 📊 Analytics dashboard
- 🔒 OAuth for Gmail (instead of app passwords)
- 📧 Outlook/Office 365 support
- 🎨 UI themes
- 📱 Mobile app
- 🔔 Custom alert sounds

## Questions?

Feel free to open an issue for any questions. We're happy to help!

---

<p align="center">
  Made with ❤️ by the MailAlarm community
</p>
