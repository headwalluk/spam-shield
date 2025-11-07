const db = require('../db/knex');
const { validateLicence } = require('../utils/validators');

class LicenceModel {
  async create({ user_id, licence_type, daily_reset_time_utc }) {
    const validation = validateLicence({ licence_type, daily_reset_time_utc });
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    const [id] = await db('licences').insert({ user_id, licence_type, daily_reset_time_utc });
    return id;
  }

  async findByUserId(user_id) {
    return db('licences').where({ user_id }).first();
  }

  async updateByUserId(user_id, data) {
    const validation = validateLicence(data);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    await db('licences')
      .where({ user_id })
      .update({ ...data, updated_at: db.fn.now() });
    return this.findByUserId(user_id);
  }
}

module.exports = new LicenceModel();
