class IpReputationController {
  constructor(ipReputationService) {
    this.ipReputationService = ipReputationService;
    this.getIpReputation = this.getReputation.bind(this);
    this.logIpActivity = this.logActivity.bind(this);
    this.resetIpActivity = this.resetActivity.bind(this);
  }

  async getReputation(req, res) {
    const { ip } = req.params;
    try {
      const reputationData = await this.ipReputationService.getReputation(ip);
      if (!reputationData) {
        return res.status(404).json({ message: 'IP address not found' });
      }
      res.json(reputationData);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving IP reputation', error: error.message });
    }
  }

  async logActivity(req, res) {
    const { ip } = req.body;
    try {
      await this.ipReputationService.logActivity(ip);
      res.status(200).json({ message: 'IP activity logged successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error logging IP activity', error: error.message });
    }
  }

  async resetActivity(req, res) {
    const { ip } = req.params;
    try {
      await this.ipReputationService.resetActivity(ip);
      res.status(200).json({ message: 'IP activity reset successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting IP activity', error: error.message });
    }
  }
}

module.exports = IpReputationController;
