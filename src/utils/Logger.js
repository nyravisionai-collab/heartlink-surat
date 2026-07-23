/**
 * Phase 06: Centralized Logging
 */
const logs = []
const MAX_LOGS = 100

const logLevel = (level) => {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 }
  return levels[level] || 1
}

const Logger = {
  info: (message, context = {}) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
    }
    logs.push(entry)
    if (logs.length > MAX_LOGS) logs.shift()
    console.log('[INFO]', message, context)
  },

  warn: (message, context = {}) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
    }
    logs.push(entry)
    if (logs.length > MAX_LOGS) logs.shift()
    console.warn('[WARN]', message, context)
  },

  error: (message, context = {}) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
    }
    logs.push(entry)
    if (logs.length > MAX_LOGS) logs.shift()
    console.error('[ERROR]', message, context)
  },

  debug: (message, context = {}) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      context,
    }
    logs.push(entry)
    if (logs.length > MAX_LOGS) logs.shift()
    console.debug('[DEBUG]', message, context)
  },

  getLogs: () => logs.slice(),
  clear: () => { logs.length = 0 },
}

export default Logger
