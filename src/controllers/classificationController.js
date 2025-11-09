const classificationService = require('../services/classificationService');

async function postClassify(req, res) {
  const { ip, fields, message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message required' });
  }
  try {
    const data = await classificationService.classifyAndLog({ ip, fields, message });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error classifying message', error: error.message });
  }
}

module.exports = { postClassify };
