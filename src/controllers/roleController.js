const roleModel = require('../models/roleModel');

async function getRoles(req, res) {
  try {
    const roles = await roleModel.all();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).send('Error fetching roles');
  }
}

module.exports = {
  getRoles
};
