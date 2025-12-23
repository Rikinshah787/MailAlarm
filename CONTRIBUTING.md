# Contributing to EmailGuard

Thank you for considering contributing to EmailGuard! We welcome contributions from everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (Node version, OS, etc.)

### Suggesting Features

1. Open an issue with the "Feature Request" label
2. Describe the feature and its use case
3. Explain why it would be valuable

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add: your feature description"`
6. Push to your fork: `git push origin feature/your-feature`
7. Open a Pull Request

### Code Style

- Use 2-space indentation
- Use meaningful variable names
- Add comments for complex logic
- Follow existing patterns in the codebase

### Testing

Before submitting a PR:
1. Run `npm start` and verify the app works
2. Test email detection with `/simulate-email`
3. Test phone calls with `/test-call`
4. Verify the web UI works

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/emailguard.git
cd emailguard

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Then run
npm start
```

## Questions?

Feel free to open an issue for any questions!
