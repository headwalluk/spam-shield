const authService = require('../services/authService');
const passport = require('../middleware/passport');
const config = require('../config');

class AuthController {
  me(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    res.json({ id: req.user.id, email: req.user.email, roles: req.user.roles });
  }

  async register(req, res) {
    if (!config.auth.enableRegistration) {
      return res.status(403).json({ error: 'REGISTRATION_DISABLED' });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'EMAIL_PASSWORD_REQUIRED' });
    }

    const { validatePasswordStrength } = require('../utils/validators');
    const strength = validatePasswordStrength(password, config.auth.passwordPolicy);
    if (!strength.valid) {
      return res.status(400).json({ error: 'WEAK_PASSWORD', details: strength.errors });
    }
    try {
      // If development and first user, elevate to administrator in addition to default 'user' role
      const db = require('../db/knex');
      const [{ cnt }] = await db('users').count({ cnt: '*' });
      const shouldAdmin = config.env === 'development' && Number(cnt) === 0;

      const user = await authService.register({ email, password });

      if (shouldAdmin) {
        try {
          const userModel = require('../models/userModel');
          const roleModel = require('../models/roleModel');
          const adminRole = await roleModel.findByName('administrator');
          if (adminRole) {
            await userModel.assignRole(user.id, adminRole.id);
          }
        } catch (e) {
          console.warn('Failed to assign administrator role to first user:', e.message);
        }
      }
      const roles = await authService.getUserRoles(user.id);
      res.status(201).json({ id: user.id, email: user.email, roles });
    } catch (e) {
      if (e.message === 'EMAIL_EXISTS') {
        return res.status(409).json({ error: 'EMAIL_EXISTS' });
      }
      res.status(500).json({ error: 'REGISTER_FAILED' });
    }
  }

  login(req, res, next) {
    passport.authenticate('local', async (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        const code = (info && info.code) || 'INVALID_CREDENTIALS';
        return res.status(401).json({ error: code });
      }
      req.logIn(user, async (err2) => {
        if (err2) {
          return next(err2);
        }
        const roles = await authService.getUserRoles(user.id);
        res.json({ id: user.id, email: user.email, roles });
      });
    })(req, res, next);
  }

  logout(req, res) {
    req.logout(() => {
      res.status(204).send();
    });
  }

  async issueApiKey(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }
    const { label } = req.body;
    try {
      const { apiKey } = await authService.issueApiKey(req.user.id, label);
      res.status(201).json({ apiKey });
    } catch {
      res.status(500).json({ error: 'ISSUE_KEY_FAILED' });
    }
  }

  async resetPasswordRequest(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'EMAIL_REQUIRED' });
    }
    try {
      // better: userModel.findByEmail
      const userRow = await require('../models/userModel').findByEmail(email);
      if (!userRow) {
        return res.status(200).json({}); // do not leak existence
      }
      const { resetToken } = await authService.createPasswordReset(userRow.id);
      // In production we'd email resetToken; here return for dev convenience
      res.status(201).json({ resetToken });
    } catch {
      res.status(500).json({ error: 'RESET_REQUEST_FAILED' });
    }
  }

  async resetPasswordConsume(req, res) {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'TOKEN_PASSWORD_REQUIRED' });
    }
    try {
      await authService.consumePasswordReset(token, password);
      res.status(204).send();
    } catch (e) {
      if (e.message === 'RESET_INVALID') {
        return res.status(400).json({ error: 'RESET_INVALID' });
      }
      res.status(500).json({ error: 'RESET_FAILED' });
    }
  }

  async verifyEmail(req, res) {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'TOKEN_REQUIRED' });
    }
    try {
      const user = await authService.consumeEmailVerification(token);
      return res.json({ id: user.id, email: user.email, status: user.status_slug });
    } catch (e) {
      if (e.message === 'VERIFY_INVALID') {
        return res.status(400).json({ error: 'VERIFY_INVALID' });
      }
      return res.status(500).json({ error: 'VERIFY_FAILED' });
    }
  }

  async resendVerification(req, res) {
    if (!req.body || !req.body.email) {
      return res.status(400).json({ error: 'EMAIL_REQUIRED' });
    }
    try {
      const user = await require('../models/userModel').findByEmail(req.body.email);
      if (!user) {
        return res.status(200).json({}); // Do not leak
      }
      if (user.status_slug === 'active') {
        return res.status(200).json({});
      }
      try {
        await authService.resendEmailVerification(user);
        return res.status(201).json({});
      } catch (e) {
        if (e.message.startsWith('VERIFY_RESEND_COOLDOWN')) {
          const mins = e.message.split(':')[1];
          return res
            .status(429)
            .json({ error: 'VERIFY_RESEND_COOLDOWN', minutesRemaining: Number(mins) });
        }
        throw e;
      }
    } catch {
      return res.status(500).json({ error: 'VERIFY_RESEND_FAILED' });
    }
  }

  generatePassword(req, res) {
    const p = config.auth.passwordPolicy;
    const length = p.generateLength || p.minLength;
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const symbols = p.symbols;
    let pool = '';
    if (p.requireUpper) {
      pool += upper;
    }
    if (p.requireLower) {
      pool += lower;
    }
    if (p.requireDigit) {
      pool += digits;
    }
    if (p.requireSymbol) {
      pool += symbols;
    }
    if (!pool) {
      pool = upper + lower + digits + symbols;
    }

    function pick(str) {
      return str[Math.floor(Math.random() * str.length)];
    }

    const requiredPieces = [];
    if (p.requireUpper) {
      requiredPieces.push(pick(upper));
    }
    if (p.requireLower) {
      requiredPieces.push(pick(lower));
    }
    if (p.requireDigit) {
      requiredPieces.push(pick(digits));
    }
    if (p.requireSymbol) {
      requiredPieces.push(pick(symbols));
    }

    const remaining = length - requiredPieces.length;
    for (let i = 0; i < remaining; i++) {
      requiredPieces.push(pick(pool));
    }

    // Fisher–Yates shuffle
    for (let i = requiredPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [requiredPieces[i], requiredPieces[j]] = [requiredPieces[j], requiredPieces[i]];
    }
    const password = requiredPieces.join('');
    res.json({ password });
  }
}

module.exports = new AuthController();
