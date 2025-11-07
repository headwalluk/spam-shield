const db = require('../db/knex');

class UserModel {
  async create({ email, password_hash, status_slug = 'active' }) {
    const [id] = await db('users').insert({ email, password_hash, status_slug });
    return id;
  }

  async findById(id) {
    return db('users').where({ id }).first();
  }

  async findByEmail(email) {
    return db('users').where({ email }).first();
  }

  async update(id, data) {
    await db('users')
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() });
    return this.findById(id);
  }

  async setStatus(id, status_slug) {
    await db('users').where({ id }).update({ status_slug, updated_at: db.fn.now() });
    return this.findById(id);
  }

  async delete(id) {
    return db('users').where({ id }).del();
  }

  // Role associations via user_roles
  async assignRole(user_id, role_id) {
    await db('user_roles').insert({ user_id, role_id }).onConflict(['user_id', 'role_id']).ignore();
  }

  async removeRole(user_id, role_id) {
    await db('user_roles').where({ user_id, role_id }).del();
  }

  async getRoles(user_id) {
    return db('roles')
      .join('user_roles', 'roles.id', 'user_roles.role_id')
      .where('user_roles.user_id', user_id)
      .select('roles.*');
  }
}

module.exports = new UserModel();
