const userModel = require('../models/userModel');
const { generatePassword } = require('../utils/validators');
const config = require('../config');

async function getUsers(req, res) {
  const { page = 1, limit = 10, email } = req.query;
  try {
    const users = await userModel.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      email
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
  }
}

async function createUser(req, res) {
  const { email } = req.body;
  try {
    const password = generatePassword(config.auth.passwordPolicy);
    const userId = await userModel.create(email, password);
    res.status(201).json({ id: userId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { email } = req.body;
  try {
    await userModel.update(id, { email });
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
  createUser,
  updateUser,
  deleteUser
};
