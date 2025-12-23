const { config, validateConfig } = require('./config');
const { initTwilio } = require('./phoneService');
const { startServer } = require('./api');
const { initEmailMonitor } = require('./emailMonitor');

console.log('═══════════════════════════════════════════════════════════');
console.log('        📧 NEVER MISS IMPORTANT EMAIL - Starting...        ');
console.log('═══════════════════════════════════════════════════════════\n');

// Validate configuration
const isValid = validateConfig();
if (!isValid) {
    console.log('\n⚠️  Running in demo mode (no calls will be made)');
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

console.log('═══════════════════════════════════════════════════════════');
console.log('                   Ready to protect you!                    ');
console.log('═══════════════════════════════════════════════════════════\n');
