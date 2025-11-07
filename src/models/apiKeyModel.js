const db = require('../db/knex');

class ApiKeyModel {
  async create(user_id, key_hash, label) {
    const [id] = await db('api_keys').insert({ user_id, key_hash, label });
    return id;
  }
  async findByHash(key_hash) {
    return db('api_keys').where({ key_hash }).whereNull('revoked_at').first();
  }
  async listByUser(user_id) {
    return db('api_keys').where({ user_id }).select('*');
  }
  async revoke(id) {
    return db('api_keys').where({ id }).update({ revoked_at: db.fn.now() });
  }
}
module.exports = new ApiKeyModel();
