const db = require('../db/knex');

class EmailVerificationModel {
  async create({ user_id, token_hash, expires_at }) {
    const [id] = await db('email_verification_tokens').insert({ user_id, token_hash, expires_at });
    return id;
  }

  async findValidByHash(token_hash) {
    return db('email_verification_tokens')
      .where({ token_hash })
      .whereNull('used_at')
      .andWhere('expires_at', '>', db.fn.now())
      .first();
  }

  async markUsed(id) {
    await db('email_verification_tokens').where({ id }).update({ used_at: db.fn.now() });
  }
}

module.exports = new EmailVerificationModel();
