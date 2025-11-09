const db = require('../db/knex');
const bcrypt = require('bcryptjs');

class UserModel {
  async create(email, password) {
    const password_hash = await bcrypt.hash(password, 10);
    const [id] = await db('users').insert({ email, password_hash, status_slug: 'active' });
    return id;
  }

  async findAll({ page = 1, limit = 10, email } = {}) {
    // Base query for filtering
    const baseQuery = db('users');
    if (email) {
      baseQuery.where('users.email', 'like', `%${email}%`);
    }

    // Count total records matching the filter for pagination
    const countResult = await baseQuery.clone().count('id as total').first();
    const total = parseInt(countResult.total, 10);
    const totalPages = Math.ceil(total / limit);

    // Get the actual user data for the current page
    const offset = (page - 1) * limit;
    const users = await db('users')
      .select(
        'users.id',
        'users.email',
        'users.status_slug as status',
        db.raw('GROUP_CONCAT(roles.name) as roles')
      )
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .where(function () {
        if (email) {
          this.where('users.email', 'like', `%${email}%`);
        }
      })
      .groupBy('users.id')
      .orderBy('users.id')
      .limit(limit)
      .offset(offset);

    // Process roles from comma-separated string to array
    users.forEach((user) => {
      user.roles = user.roles ? user.roles.split(',') : [];
    });

    return {
      users,
      pagination: {
        currentPage: page,
        limit,
        totalPages,
        total
      }
    };
  }

  async findById(id) {
    return db('users').where({ id }).first();
  }

  async findByIdWithRoles(id) {
    const user = await db('users').where('users.id', id).first();
    if (!user) {
      return null;
    }

    const roles = await db('roles')
      .join('user_roles', 'roles.id', 'user_roles.role_id')
      .where('user_roles.user_id', id)
      .select('roles.name');

    user.roles = roles.map((r) => r.name);
    return user;
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

  async deleteById(id) {
    return db('users').where({ id }).del();
  }

  // Role associations via user_roles
  async assignRole(user_id, role_id) {
    await db('user_roles').insert({ user_id, role_id }).onConflict(['user_id', 'role_id']).ignore();
  }

  async removeRole(user_id, role_id) {
    await db('user_roles').where({ user_id, role_id }).del();
  }

  async syncRoles(user_id, role_ids) {
    // Use a transaction to ensure atomicity
    return db.transaction(async (trx) => {
      // First, remove all existing roles for the user
      await trx('user_roles').where({ user_id }).del();

      // Then, insert the new roles
      if (role_ids && role_ids.length > 0) {
        const rolesToInsert = role_ids.map((role_id) => ({
          user_id,
          role_id
        }));
        await trx('user_roles').insert(rolesToInsert);
      }
    });
  }

  async getRoles(user_id) {
    return db('roles')
      .join('user_roles', 'roles.id', 'user_roles.role_id')
      .where('user_roles.user_id', user_id)
      .select('roles.*');
  }
}

module.exports = new UserModel();
