const db = require('../db/knex');

class PasswordResetModel {
  async create({ user_id, token_hash, expires_at }) {
    const [id] = await db('password_resets').insert({ user_id, token_hash, expires_at });
    return id;
  }
  async findValid(token_hash) {
    return db('password_resets')
      .where({ token_hash })
      .whereNull('used_at')
      .andWhere('expires_at', '>', db.fn.now())
      .first();
  }
  async markUsed(id) {
    return db('password_resets').where({ id }).update({ used_at: db.fn.now() });
  }
}
module.exports = new PasswordResetModel();
