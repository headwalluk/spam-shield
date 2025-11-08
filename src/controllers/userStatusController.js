const userStatusModel = require('../models/userStatusModel');

async function getUserStatuses(req, res) {
  try {
    const statuses = await userStatusModel.all();
    res.json(statuses);
  } catch (error) {
    console.error('Error fetching user statuses:', error);
    res.status(500).send('Error fetching user statuses');
  }
}

module.exports = {
  getUserStatuses
};
