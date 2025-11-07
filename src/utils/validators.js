module.exports = {
  validateMessage: (message) => {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return { valid: false, error: 'Message must be a non-empty string.' };
    }
    return { valid: true };
  },

  validateIpAddress: (ip) => {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      return { valid: false, error: 'Invalid IP address format.' };
    }
    return { valid: true };
  },

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format.' };
    }
    return { valid: true };
  },

  validateLicence: ({ licence_type, daily_reset_time_utc }) => {
    const allowed = ['unmetered', 'daily-metered'];
    if (!allowed.includes(licence_type)) {
      return { valid: false, error: `licence_type must be one of: ${allowed.join(', ')}` };
    }
    if (licence_type === 'daily-metered') {
      // Accept HH:MM or HH:MM:SS
      const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
      if (!daily_reset_time_utc || !timeRegex.test(daily_reset_time_utc)) {
        return {
          valid: false,
          error:
            'daily_reset_time_utc must be HH:MM or HH:MM:SS (UTC) when licence_type is daily-metered.'
        };
      }
    } else if (daily_reset_time_utc) {
      return {
        valid: false,
        error: 'daily_reset_time_utc must be null/empty for unmetered licences.'
      };
    }
    return { valid: true };
  },

  validatePasswordStrength: (password, policy) => {
    const errors = [];
    if (typeof password !== 'string' || password.length === 0) {
      return { valid: false, errors: ['Password required'] };
    }
    const p = policy || {
      minLength: 12,
      requireUpper: true,
      requireLower: true,
      requireDigit: true,
      requireSymbol: true,
      symbols: '!@#$%^&*()-_=+[]{};:,.<>/?'
    };
    if (password.length < p.minLength) {
      errors.push(`Must be at least ${p.minLength} characters`);
    }
    if (p.requireUpper && !/[A-Z]/.test(password)) {
      errors.push('Must include an uppercase letter');
    }
    if (p.requireLower && !/[a-z]/.test(password)) {
      errors.push('Must include a lowercase letter');
    }
    if (p.requireDigit && !/[0-9]/.test(password)) {
      errors.push('Must include a digit');
    }
    if (p.requireSymbol) {
      const symbolsRe = new RegExp('[' + p.symbols.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + ']');
      if (!symbolsRe.test(password)) {
        errors.push('Must include a symbol');
      }
    }
    return { valid: errors.length === 0, errors };
  }
};
