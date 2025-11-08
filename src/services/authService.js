const bcrypt = require('bcryptjs');
const nodeCrypto = require('crypto');
const userModel = require('../models/userModel');
const roleModel = require('../models/roleModel');
const apiKeyModel = require('../models/apiKeyModel');
const passwordResetModel = require('../models/passwordResetModel');
const emailVerificationModel = require('../models/emailVerificationModel');
const config = require('../config');
const db = require('../db/knex');
const mailer = require('./mailerService');

class AuthService {
  async register({ email, password }) {
    const existing = await userModel.findByEmail(email);
    if (existing) {
      throw new Error('EMAIL_EXISTS');
    }
    const password_hash = await bcrypt.hash(password, 10);
    // New users start as 'pending' by default
    const user_id = await userModel.create({ email, password_hash, status_slug: 'pending' });
    // Assign default 'user' role
    const userRole = await roleModel.findByName('user');
    if (userRole) {
      await userModel.assignRole(user_id, userRole.id);
    }
    // Create verification token and send email (best-effort)
    try {
      const { verifyUrl } = await this.createEmailVerification(user_id);
      await mailer.sendTemplate(email, 'Verify your email', 'verify-email', { verifyUrl });
    } catch (e) {
      console.warn('Verification email error:', e.message);
    }
    return userModel.findById(user_id);
  }

  async verifyPassword(email, password) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return null;
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return null;
    }
    // Block non-active accounts
    if (user.status_slug !== 'active') {
      // Attach a hint so controller/strategy can surface meaningful message
      user.__blockedReason =
        user.status_slug === 'pending' ? 'EMAIL_NOT_VERIFIED' : 'STATUS_NOT_ACTIVE';
    }
    return user;
  }

  async issueApiKey(user_id, label) {
    const raw = nodeCrypto.randomBytes(32).toString('hex');
    const key_hash = nodeCrypto.createHash('sha256').update(raw).digest('hex');
    await apiKeyModel.create(user_id, key_hash, label);
    return { apiKey: raw }; // return raw key once
  }

  async authenticateApiKey(rawKey) {
    if (!rawKey) {
      return null;
    }
    const key_hash = nodeCrypto.createHash('sha256').update(rawKey).digest('hex');
    const keyRow = await apiKeyModel.findByHash(key_hash);
    if (!keyRow) {
      return null;
    }
    const user = await userModel.findById(keyRow.user_id);
    if (!user) {
      return null;
    }
    // Eagerly load roles for downstream authorization
    const roles = await userModel.getRoles(user.id);
    user.roles = roles.map((r) => r.name);
    return user;
  }

  async createPasswordReset(user_id) {
    const raw = nodeCrypto.randomBytes(32).toString('hex');
    const token_hash = nodeCrypto.createHash('sha256').update(raw).digest('hex');
    const expires_at = new Date(Date.now() + config.auth.resetTokenTTLMinutes * 60000);
    await passwordResetModel.create({ user_id, token_hash, expires_at });
    return { resetToken: raw };
  }

  async consumePasswordReset(rawToken, newPassword) {
    const token_hash = nodeCrypto.createHash('sha256').update(rawToken).digest('hex');
    const resetRow = await passwordResetModel.findValid(token_hash);
    if (!resetRow) {
      throw new Error('RESET_INVALID');
    }
    const password_hash = await bcrypt.hash(newPassword, 10);
    await db('users')
      .where({ id: resetRow.user_id })
      .update({ password_hash, updated_at: db.fn.now() });
    await passwordResetModel.markUsed(resetRow.id);
  }

  async getUserRoles(user_id) {
    return userModel.getRoles(user_id);
  }

  // Email verification
  async createEmailVerification(user_id) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const token_hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires_at = new Date(Date.now() + config.auth.verifyEmailTokenTTLMinutes * 60000);
    await emailVerificationModel.create({ user_id, token_hash, expires_at });
    const verifyUrl = `${config.auth.baseUrl}/verify-email?token=${rawToken}`;
    return { rawToken, verifyUrl };
  }

  async resendEmailVerification(user) {
    // Rate-limit using most recent valid token
    const cooldownMs = config.auth.verifyEmailResendCooldownMinutes * 60000;
    const tokenRow = await db('email_verification_tokens')
      .where({ user_id: user.id })
      .whereNull('used_at')
      .orderBy('created_at', 'desc')
      .first();
    if (tokenRow) {
      const age = Date.now() - new Date(tokenRow.created_at).getTime();
      if (age < cooldownMs) {
        const remaining = Math.ceil((cooldownMs - age) / 60000);
        throw new Error('VERIFY_RESEND_COOLDOWN:' + remaining);
      }
    }
    const { verifyUrl } = await this.createEmailVerification(user.id);
    await mailer.sendTemplate(user.email, 'Verify your email', 'verify-email', { verifyUrl });
    return { verifyUrl };
  }

  async consumeEmailVerification(rawToken) {
    const token_hash = nodeCrypto.createHash('sha256').update(rawToken).digest('hex');
    const row = await emailVerificationModel.findValidByHash(token_hash);
    if (!row) {
      throw new Error('VERIFY_INVALID');
    }
    await userModel.setStatus(row.user_id, 'active');
    await emailVerificationModel.markUsed(row.id);
    return await userModel.findById(row.user_id);
  }
}

module.exports = new AuthService();
