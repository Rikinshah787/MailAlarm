const twilio = require('twilio');
const { config } = require('./config');
const stateManager = require('./stateManager');

let client = null;
let activeCallLoop = null;

/**
 * Initialize Twilio client
 */
function initTwilio() {
    if (!config.twilio.accountSid || !config.twilio.authToken) {
        console.error('❌ Twilio credentials not configured');
        return false;
    }
    client = twilio(config.twilio.accountSid, config.twilio.authToken);
    console.log('📞 Twilio initialized');
    return true;
}

/**
 * Generate TwiML for the call with keypad input
 * User can press 199 to stop the calls
 */
function generateCallTwiML(senderEmail, subject) {
    // Use the app's public URL for the gather callback
    const callbackUrl = `${config.appUrl}/twilio-gather`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Important email from ${senderEmail}.</Say>
  <Say voice="alice">Subject: ${subject}.</Say>
  <Gather input="dtmf" numDigits="3" action="${callbackUrl}" method="POST" timeout="10">
    <Say voice="alice">Press 1 9 9 on your keypad to stop these calls.</Say>
  </Gather>
  <Say voice="alice">No input received. We will call you again.</Say>
</Response>`;
}

/**
 * Make a single phone call with keypad input option
 */
async function makeCall(senderEmail, subject) {
    if (!client) {
        console.error('❌ Twilio client not initialized');
        return null;
    }

    try {
        const twiml = generateCallTwiML(senderEmail, subject);

        const call = await client.calls.create({
            to: config.twilio.yourPhoneNumber,
            from: config.twilio.phoneNumber,
            twiml: twiml,
        });

        console.log(`📞 Call initiated: ${call.sid}`);
        stateManager.logCall(senderEmail, subject, call.sid);
        return call.sid;
    } catch (error) {
        console.error('❌ Failed to make call:', error.message);
        return null;
    }
}

/**
 * Start the call loop - keeps calling until stopped
 */
function startCallLoop(senderEmail, subject) {
    // Stop any existing loop
    stopCallLoop();

    console.log(`🔔 Starting call loop for email from: ${senderEmail}`);

    const callInterval = config.callIntervalSeconds * 1000;

    // Make first call immediately
    makeCall(senderEmail, subject);

    // Set up recurring calls
    activeCallLoop = setInterval(async () => {
        // Check if stopped
        if (stateManager.isStopped()) {
            console.log('🛑 Call loop stopped by user');
            stopCallLoop();
            return;
        }

        // Make another call
        await makeCall(senderEmail, subject);
    }, callInterval);

    console.log(`⏰ Will call every ${config.callIntervalSeconds} seconds until stopped`);
}

/**
 * Stop the call loop
 */
function stopCallLoop() {
    if (activeCallLoop) {
        clearInterval(activeCallLoop);
        activeCallLoop = null;
        console.log('🛑 Call loop cleared');
    }
}

/**
 * Check if call loop is active
 */
function isCallLoopActive() {
    return activeCallLoop !== null;
}

module.exports = {
    initTwilio,
    makeCall,
    startCallLoop,
    stopCallLoop,
    isCallLoopActive,
};
