const fs = require('fs');
const path = require('path');

// JSON file for state storage (simpler than SQLite, no native deps)
const dataPath = path.join(__dirname, '..', 'data.json');

// Initialize data file
function initData() {
  if (!fs.existsSync(dataPath)) {
    const initialData = {
      isStopped: false,
      stoppedAt: null,
      startedAt: new Date().toISOString(),
      callLogs: [],
    };
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
}

function readData() {
  initData();
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

const stateManager = {
  /**
   * Check if notifications are stopped
   */
  isStopped() {
    const data = readData();
    return data.isStopped;
  },

  /**
   * Stop notifications (when user enters 199)
   */
  stop() {
    const data = readData();
    data.isStopped = true;
    data.stoppedAt = new Date().toISOString();
    writeData(data);
    console.log('🛑 Notifications STOPPED');
  },

  /**
   * Start notifications (re-enable)
   */
  start() {
    const data = readData();
    data.isStopped = false;
    data.startedAt = new Date().toISOString();
    data.stoppedAt = null;
    writeData(data);
    console.log('✅ Notifications ENABLED');
  },

  /**
   * Get current status
   */
  getStatus() {
    const data = readData();
    return {
      isStopped: data.isStopped,
      stoppedAt: data.stoppedAt,
      startedAt: data.startedAt,
    };
  },

  /**
   * Log a phone call
   */
  logCall(senderEmail, subject, callSid) {
    const data = readData();
    data.callLogs.unshift({
      senderEmail,
      subject,
      callSid,
      calledAt: new Date().toISOString(),
    });
    // Keep only last 100 logs
    data.callLogs = data.callLogs.slice(0, 100);
    writeData(data);
  },

  /**
   * Get recent call logs
   */
  getRecentCalls(limit = 10) {
    const data = readData();
    return data.callLogs.slice(0, limit);
  },
};

module.exports = stateManager;
