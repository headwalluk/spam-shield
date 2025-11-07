const db = require('../db/knex');

class RoleModel {
  async all() {
    return db('roles').select('*');
  }
  async findByName(name) {
    return db('roles').where({ name }).first();
  }
  async findById(id) {
    return db('roles').where({ id }).first();
  }
}

module.exports = new RoleModel();
