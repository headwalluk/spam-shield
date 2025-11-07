class IpReputationService {
  constructor() {
    this.ipReputationData = new Map(); // In-memory store for IP reputation data
  }

  // Method to add or update IP reputation
  setReputation(ip, reputationScore) {
    this.ipReputationData.set(ip, reputationScore);
  }

  // Method to get the reputation score of an IP
  getReputation(ip) {
    return this.ipReputationData.get(ip) || null; // Return null if IP not found
  }

  // Method to remove an IP from the reputation data
  removeReputation(ip) {
    this.ipReputationData.delete(ip);
  }

  // Method to get all IP reputations
  getAllReputations() {
    return Array.from(this.ipReputationData.entries());
  }
}

module.exports = new IpReputationService();
