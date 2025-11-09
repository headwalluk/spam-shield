const service = require('../services/ipReputationService');

async function getIp(req, res) {
  const { ip } = req.params;
  try {
    const data = await service.getIpReputation(ip);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving IP reputation', error: error.message });
  }
}

async function postEvent(req, res) {
  const { ip } = req.params;
  const { event, country, caller } = req.body || {};
  try {
    const data = await service.logIpEvent(ip, event, { country, caller });
    res.status(201).json(data);
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ error: 'invalid event' });
    }
    res.status(500).json({ message: 'Error logging IP event', error: error.message });
  }
}

module.exports = { getIp, postEvent };
