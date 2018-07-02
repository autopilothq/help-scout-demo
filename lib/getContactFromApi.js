const request = require('request-promise');
const config = require('../config/index.js');

module.exports = function getContactFromApi(email, cb) {
    // Either return cb null, contact or return an error
  request({
    url: `https://api2.autopilothq.com/v1/contact/${email}`,
    json: true,
    headers: {
      'Content-Type': 'application/json',
      'autopilotapikey': config.apiKey
    },
  }, (err, response, body) => {
    if (err) {
      return cb(err);
    } else {
      cb(null, body); // this is actually err, contact in the other file
     }
  })
}