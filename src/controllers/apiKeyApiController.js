const apiKeyModel = require('../models/apiKeyModel');
const { issueApiKey } = require('../services/authService');

async function getApiKeys(req, res) {
  try {
    const keys = await apiKeyModel.listByUser(req.user.id);
    res.json(keys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).send('Error fetching API keys');
  }
}

async function createApiKey(req, res) {
  const { label } = req.body;
  try {
    const { apiKey } = await issueApiKey(req.user.id, label);
    res.status(201).json({ apiKey });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).send('Error creating API key');
  }
}

async function updateApiKey(req, res) {
  const { id } = req.params;
  const { label } = req.body;
  try {
    const key = await apiKeyModel.findById(id);
    if (key.user_id !== req.user.id) {
      return res.status(403).send('Forbidden A');
    }
    await apiKeyModel.relabel(id, label);
    res.status(204).send();
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).send('Error updating API key');
  }
}

async function deleteApiKey(req, res) {
  const { id } = req.params;
  try {
    const key = await apiKeyModel.findById(id);
    if (key.user_id !== req.user.id) {
      return res.status(403).send('Forbidden B');
    }
    await apiKeyModel.revoke(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).send('Error deleting API key');
  }
}

module.exports = {
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey
};
