require('dotenv').config();

const config = {
  // IMAP Email Configuration
  imap: {
    host: process.env.IMAP_HOST || 'outlook.office365.com',
    port: parseInt(process.env.IMAP_PORT || '993', 10),
    user: process.env.IMAP_USER || '',  // Your ASU email: rshah88@asu.edu
    password: process.env.IMAP_PASSWORD || '',  // App password or regular password
  },

  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    yourPhoneNumber: process.env.YOUR_PHONE_NUMBER,
  },

  // Target senders to monitor
  targetSenders: (process.env.TARGET_SENDERS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 0),

  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  stopCode: process.env.STOP_CODE || '199',
  callIntervalSeconds: parseInt(process.env.CALL_INTERVAL_SECONDS || '30', 10),
  pollIntervalSeconds: parseInt(process.env.POLL_INTERVAL_SECONDS || '30', 10),
  appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
};

// Validation
function validateConfig() {
  const warnings = [];
  const errors = [];

  // Check Twilio
  if (!config.twilio.accountSid) errors.push('TWILIO_ACCOUNT_SID');
  if (!config.twilio.authToken) errors.push('TWILIO_AUTH_TOKEN');
  if (!config.twilio.phoneNumber) errors.push('TWILIO_PHONE_NUMBER');
  if (!config.twilio.yourPhoneNumber) errors.push('YOUR_PHONE_NUMBER');

  // Check IMAP
  if (!config.imap.user) warnings.push('IMAP_USER (email monitoring disabled)');
  if (!config.imap.password) warnings.push('IMAP_PASSWORD (email monitoring disabled)');

  // Check target senders
  if (config.targetSenders.length === 0) {
    warnings.push('TARGET_SENDERS - No email addresses to monitor');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Warnings:', warnings.join(', '));
  }

  if (errors.length > 0) {
    console.error('❌ Missing required:', errors.join(', '));
    console.error('   Copy .env.example to .env and fill in the values.');
    return false;
  }

  return true;
}

module.exports = { config, validateConfig };
