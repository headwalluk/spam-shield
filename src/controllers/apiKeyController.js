const nodeCrypto = require('crypto');
const apiKeyModel = require('../models/apiKeyModel');
const userModel = require('../models/userModel');

async function createApiKey(req, res) {
  const { id: userId } = req.user;
  const { label } = req.body;

  try {
    const user = await userModel.findById(userId);
    const apiKeys = await apiKeyModel.listByUser(userId);

    if (apiKeys.length >= user.max_api_keys) {
      return res.status(400).send('API key limit reached');
    }

    const apiKey = nodeCrypto.randomBytes(16).toString('hex');
    const hash = nodeCrypto.createHash('sha256').update(apiKey).digest('hex');

    await apiKeyModel.create(userId, hash, label);
    res.status(201).json({ apiKey });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).send('Error creating API key');
  }
}

async function relabelApiKey(req, res) {
  const { id: apiKeyId } = req.params;
  const { label } = req.body;

  try {
    await apiKeyModel.relabel(apiKeyId, label);
    res.redirect('/dash/api-keys');
  } catch (error) {
    console.error('Error relabeling API key:', error);
    res.status(500).send('Error relabeling API key');
  }
}

async function deleteApiKey(req, res) {
  const { id: apiKeyId } = req.params;

  try {
    await apiKeyModel.revoke(apiKeyId);
    res.redirect('/dash/api-keys');
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).send('Error deleting API key');
  }
}

module.exports = {
  createApiKey,
  relabelApiKey,
  deleteApiKey
};
