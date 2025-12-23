const express = require('express');
const path = require('path');
const { config } = require('./config');
const stateManager = require('./stateManager');
const phoneService = require('./phoneService');
const emailWebhook = require('./emailWebhook');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// WEB UI - Stop Code Entry Page
// ============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// API ENDPOINTS
// ============================================

/**
 * POST /stop - Stop notifications with code
 */
app.post('/stop', (req, res) => {
    const { code } = req.body;

    if (String(code) === config.stopCode) {
        stateManager.stop();
        phoneService.stopCallLoop();
        return res.json({
            ok: true,
            message: 'Notifications stopped successfully! Calls will stop.'
        });
    }

    res.status(400).json({
        ok: false,
        message: 'Invalid stop code. Please enter 199.'
    });
});

/**
 * POST /start - Re-enable notifications
 */
app.post('/start', (req, res) => {
    stateManager.start();
    res.json({
        ok: true,
        message: 'Notifications enabled. You will receive calls for new important emails.'
    });
});

/**
 * GET /status - Get current status
 */
app.get('/status', (req, res) => {
    const status = stateManager.getStatus();
    const isCallActive = phoneService.isCallLoopActive();

    res.json({
        notificationsStopped: status.isStopped,
        callLoopActive: isCallActive,
        stoppedAt: status.stoppedAt,
        startedAt: status.startedAt,
        targetSenders: config.targetSenders,
    });
});

/**
 * GET /logs - Get recent call logs
 */
app.get('/logs', (req, res) => {
    const logs = stateManager.getRecentCalls(20);
    res.json({ logs });
});

// ============================================
// TWILIO PHONE KEYPAD WEBHOOK
// ============================================

/**
 * POST /twilio-gather - Handle phone keypad input (199 to stop)
 * This is called by Twilio when the user presses keys during a call
 */
app.post('/twilio-gather', (req, res) => {
    const digits = req.body.Digits;

    console.log(`📱 Phone keypad input received: ${digits}`);

    // Check if the user pressed 199
    if (digits === config.stopCode) {
        console.log('🛑 Stop code 199 entered via phone keypad!');
        stateManager.stop();
        phoneService.stopCallLoop();

        // Respond with TwiML to confirm
        res.set('Content-Type', 'text/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Stop code accepted. Notifications have been stopped. Goodbye!</Say>
  <Hangup/>
</Response>`);
    } else {
        // Wrong code, let Twilio continue with the call
        console.log(`❌ Invalid code entered: ${digits}`);
        res.set('Content-Type', 'text/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Invalid code. Please press 1 9 9 to stop calls.</Say>
  <Gather input="dtmf" numDigits="3" action="${config.appUrl}/twilio-gather" method="POST" timeout="10">
    <Say voice="alice">Press 1 9 9 now.</Say>
  </Gather>
</Response>`);
    }
});

// ============================================
// EMAIL WEBHOOK ENDPOINTS
// ============================================

/**
 * POST /webhook - Microsoft Graph webhook endpoint
 */
app.post('/webhook', (req, res) => {
    // Handle validation request from Microsoft
    if (req.query.validationToken) {
        const token = emailWebhook.handleValidation(req.query.validationToken);
        return res.status(200).contentType('text/plain').send(token);
    }

    // Process notification
    console.log('📬 Webhook notification received');
    const notifications = emailWebhook.parseGraphNotification(req.body);

    res.status(202).json({ received: true });
});

/**
 * POST /simulate-email - Test endpoint to simulate an email
 */
app.post('/simulate-email', async (req, res) => {
    const { from, subject } = req.body;

    if (!from || !subject) {
        return res.status(400).json({
            error: 'Missing required fields: from, subject'
        });
    }

    const result = await emailWebhook.processEmail({ from, subject });
    res.json(result);
});

/**
 * POST /test-call - Test phone call without email
 */
app.post('/test-call', async (req, res) => {
    if (stateManager.isStopped()) {
        return res.json({
            ok: false,
            message: 'Notifications are stopped. Enable them first with /start'
        });
    }

    phoneService.startCallLoop('test@example.com', 'Test Call');
    res.json({
        ok: true,
        message: 'Test call loop started. Press 199 on phone OR enter 199 on web page to stop.'
    });
});

// ============================================
// START SERVER
// ============================================

function startServer() {
    app.listen(config.port, () => {
        console.log(`\n🚀 Server running at http://localhost:${config.port}`);
        console.log(`   📱 Web UI: http://localhost:${config.port}`);
        console.log(`   📊 Status: http://localhost:${config.port}/status`);
        console.log(`   📝 Logs: http://localhost:${config.port}/logs`);
        console.log(`\n📧 Monitoring emails from: ${config.targetSenders.join(', ') || 'None configured'}`);
        console.log(`🔢 Stop code: ${config.stopCode} (phone keypad OR web)`);
        console.log(`📞 Calls will go to: ${config.twilio.yourPhoneNumber || 'Not configured'}\n`);
    });
}

module.exports = { app, startServer };
