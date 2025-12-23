const imaps = require('imap-simple');
const { config } = require('./config');
const stateManager = require('./stateManager');
const phoneService = require('./phoneService');

let connection = null;
let pollInterval = null;
let lastSeenUID = 0;

/**
 * Connect to email server via IMAP
 */
async function connect() {
    if (!config.imap.user || !config.imap.password) {
        console.log('⚠️  IMAP credentials not configured - email monitoring disabled');
        console.log('   Set IMAP_USER and IMAP_PASSWORD in .env file');
        return false;
    }

    try {
        const imapConfig = {
            imap: {
                user: config.imap.user,
                password: config.imap.password,
                host: config.imap.host,
                port: config.imap.port,
                tls: true,
                tlsOptions: { rejectUnauthorized: false },
                authTimeout: 30000,
            },
        };

        console.log(`📧 Connecting to ${config.imap.host}...`);
        connection = await imaps.connect(imapConfig);
        await connection.openBox('INBOX');
        console.log('✅ Connected to email server');

        // Get the latest UID to start from
        const results = await connection.search(['ALL'], { bodies: [] });
        if (results.length > 0) {
            lastSeenUID = Math.max(...results.map(r => r.attributes.uid));
        }
        console.log(`📬 Starting from UID: ${lastSeenUID}`);
        console.log(`📋 Monitoring for emails from: ${config.targetSenders.join(', ')}`);

        return true;
    } catch (error) {
        console.error('❌ Failed to connect to email:', error.message);
        return false;
    }
}

/**
 * Extract email address from a header value
 * Handles formats like: "Name <email@domain.com>" or just "email@domain.com"
 */
function extractEmail(headerValue) {
    if (!headerValue) return '';

    // If it's an array, get first element
    const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!value) return '';

    // Try to extract email from angle brackets: Name <email@domain.com>
    const match = value.match(/<([^>]+)>/);
    if (match) {
        return match[1].toLowerCase().trim();
    }

    // Otherwise return the whole thing cleaned up
    return value.toLowerCase().trim();
}

/**
 * Check for new emails from target senders
 */
async function checkNewEmails() {
    if (!connection) {
        return;
    }

    try {
        // Search for emails newer than our last seen UID
        const searchCriteria = [['UID', `${lastSeenUID + 1}:*`]];
        const fetchOptions = {
            bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)'],
            struct: true,
        };

        const messages = await connection.search(searchCriteria, fetchOptions);

        for (const message of messages) {
            const uid = message.attributes.uid;

            // Skip if we've already processed this
            if (uid <= lastSeenUID) continue;

            // Update last seen
            lastSeenUID = uid;

            // Get headers from the message parts
            const headerPart = message.parts.find(p => p.which && p.which.includes('HEADER'));
            if (!headerPart || !headerPart.body) continue;

            // headerPart.body is an object with header fields
            const headers = headerPart.body;

            // Extract from and subject
            const fromRaw = headers.from ? headers.from[0] : '';
            const subject = headers.subject ? headers.subject[0] : '(No Subject)';
            const fromEmail = extractEmail(fromRaw);

            console.log(`\n📨 New email detected! (UID: ${uid})`);
            console.log(`   From: ${fromRaw}`);
            console.log(`   Email: ${fromEmail}`);
            console.log(`   Subject: ${subject}`);

            // Check if from target sender
            const isTarget = config.targetSenders.some(target => {
                const targetLower = target.toLowerCase().trim();
                return fromEmail.includes(targetLower) || fromRaw.toLowerCase().includes(targetLower);
            });

            console.log(`   Target senders: ${config.targetSenders.join(', ')}`);
            console.log(`   Is target: ${isTarget}`);

            if (isTarget) {
                console.log(`   ⚡ TARGET SENDER DETECTED!`);

                // Check if notifications are stopped
                if (stateManager.isStopped()) {
                    console.log(`   🛑 Notifications stopped - skipping call`);
                    continue;
                }

                // Start calling!
                console.log(`   📞 Starting call loop...`);
                phoneService.startCallLoop(fromEmail, subject);
            } else {
                console.log(`   ⏭️  Not a target sender - ignoring`);
            }
        }
    } catch (error) {
        console.error('Error checking emails:', error.message);
        console.error('Stack:', error.stack);

        // Try to reconnect if connection lost
        if (error.message.includes('Not connected') ||
            error.message.includes('ECONNRESET') ||
            error.message.includes('Connection ended')) {
            console.log('🔄 Reconnecting...');
            connection = null;
            await connect();
        }
    }
}

/**
 * Start polling for new emails
 */
function startPolling(intervalSeconds = 30) {
    if (pollInterval) {
        clearInterval(pollInterval);
    }

    console.log(`⏰ Polling for new emails every ${intervalSeconds} seconds`);

    // Check immediately
    checkNewEmails();

    // Then check periodically
    pollInterval = setInterval(checkNewEmails, intervalSeconds * 1000);
}

/**
 * Stop polling
 */
function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

/**
 * Disconnect from email server
 */
async function disconnect() {
    stopPolling();
    if (connection) {
        try {
            await connection.end();
        } catch (e) {
            // Ignore
        }
        connection = null;
    }
}

/**
 * Initialize email monitoring
 */
async function initEmailMonitor() {
    const connected = await connect();
    if (connected) {
        startPolling(config.pollIntervalSeconds);
    }
    return connected;
}

module.exports = {
    connect,
    checkNewEmails,
    startPolling,
    stopPolling,
    disconnect,
    initEmailMonitor,
};
