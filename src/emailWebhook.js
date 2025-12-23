const { config } = require('./config');
const stateManager = require('./stateManager');
const phoneService = require('./phoneService');

/**
 * Process an incoming email notification
 * This is called when Microsoft Graph sends a webhook notification
 * or when manually testing with /simulate-email endpoint
 */
async function processEmail(emailData) {
    const { from, subject } = emailData;
    const senderEmail = from.toLowerCase();

    console.log(`📧 Email received from: ${senderEmail}`);
    console.log(`   Subject: ${subject}`);

    // Check if sender is in target list
    const isTargetSender = config.targetSenders.some(target =>
        senderEmail.includes(target) || target.includes(senderEmail)
    );

    if (!isTargetSender) {
        console.log('   ⏭️  Not a target sender, ignoring');
        return { action: 'ignored', reason: 'not_target_sender' };
    }

    // Check if notifications are stopped
    if (stateManager.isStopped()) {
        console.log('   🛑 Notifications are stopped, skipping call');
        return { action: 'skipped', reason: 'notifications_stopped' };
    }

    // Start the call loop
    console.log('   🔔 Target sender detected! Starting call loop...');
    phoneService.startCallLoop(senderEmail, subject);

    return { action: 'calling', senderEmail, subject };
}

/**
 * Handle Microsoft Graph webhook validation
 * Microsoft sends a validation request when setting up the subscription
 */
function handleValidation(validationToken) {
    console.log('✅ Microsoft Graph validation request received');
    return validationToken;
}

/**
 * Parse Microsoft Graph notification payload
 */
function parseGraphNotification(body) {
    try {
        // Microsoft Graph sends notifications in a specific format
        if (body.value && Array.isArray(body.value)) {
            return body.value.map(notification => ({
                changeType: notification.changeType,
                resource: notification.resource,
                // Additional email details would need to be fetched via Graph API
            }));
        }
        return [];
    } catch (error) {
        console.error('Failed to parse Graph notification:', error);
        return [];
    }
}

module.exports = {
    processEmail,
    handleValidation,
    parseGraphNotification,
};
