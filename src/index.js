const { config, validateConfig } = require('./config');
const { initTwilio } = require('./phoneService');
const { startServer } = require('./api');
const { initEmailMonitor } = require('./emailMonitor');

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════╗');
console.log('  ║                                                          ║');
console.log('  ║   🔔  M A I L A L A R M                                  ║');
console.log('  ║       "Get called when it matters"                       ║');
console.log('  ║                                                          ║');
console.log('  ╚══════════════════════════════════════════════════════════╝');
console.log('');

// Validate configuration
const isValid = validateConfig();
if (!isValid) {
    console.log('⚠️  Running in demo mode (no calls will be made)');
    console.log('   Set up your .env file for full functionality.\n');
}

// Initialize Twilio
initTwilio();

// Start the API server
startServer();

// Start email monitoring
console.log('\n📬 Initializing email monitor...');
initEmailMonitor().then(connected => {
    if (connected) {
        console.log('✅ Email monitoring active!\n');
    } else {
        console.log('⚠️  Email monitoring not started - check IMAP credentials\n');
        console.log('   You can still test with the /simulate-email endpoint\n');
    }
});

console.log('');
console.log('  ═══════════════════════════════════════════════════════════');
console.log('         🚀 MailAlarm is ready to protect you!');
console.log('  ═══════════════════════════════════════════════════════════');
console.log('');
