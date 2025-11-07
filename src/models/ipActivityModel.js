const mongoose = require('mongoose');

const ipActivitySchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    unique: true
  },
  activity: {
    type: [String],
    default: []
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

const IpActivity = mongoose.model('IpActivity', ipActivitySchema);

module.exports = IpActivity;
