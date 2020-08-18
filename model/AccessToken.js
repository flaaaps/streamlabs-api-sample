const mongoose = require('mongoose');

const AccessTokenSchema = mongoose.Schema({
  access_token: String,
  refresh_token: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AccessToken', AccessTokenSchema, 'streamlabs-auth');
