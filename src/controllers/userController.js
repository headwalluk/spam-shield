const userModel = require('../models/userModel');
const { generatePassword } = require('../utils/validators');
const config = require('../config');

async function getUsers(req, res) {
  const { page = 1, limit = 10, email } = req.query;
  try {
    const data = await userModel.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      email
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
  }
}

async function getUser(req, res) {
  const { id } = req.params;
  try {
    const user = await userModel.findByIdWithRoles(id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    res.status(500).send('Error fetching user');
  }
}

async function createUser(req, res) {
  const { email, roles } = req.body;
  try {
    const password = generatePassword(config.auth.passwordPolicy);
    const userId = await userModel.create(email, password);
    if (roles && roles.length > 0) {
      await userModel.syncRoles(userId, roles);
    }
    res.status(201).json({ id: userId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { email, status, roles } = req.body;
  try {
    const updateData = {};
    if (email) {
      updateData.email = email;
    }
    if (status) {
      updateData.status_slug = status;
    }

    if (Object.keys(updateData).length > 0) {
      await userModel.update(id, updateData);
    }

    if (roles) {
      await userModel.syncRoles(id, roles);
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating user');
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await userModel.deleteById(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Error deleting user');
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};
