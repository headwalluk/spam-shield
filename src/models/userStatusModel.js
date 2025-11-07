const db = require('../db/knex');

class UserStatusModel {
  async all() {
    return db('user_statuses').select('*').orderBy('slug');
  }

  async findBySlug(slug) {
    return db('user_statuses').where({ slug }).first();
  }

  async upsert({ slug, title }) {
    await db('user_statuses').insert({ slug, title }).onConflict('slug').merge({ title });
    return this.findBySlug(slug);
  }
}

module.exports = new UserStatusModel();
