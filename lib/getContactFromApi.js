const request = require('request');
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
    } else if (response.statusCode === 401) {
      const unauthorizedError = Error("Api key not authorized");
      unauthorizedError.notAuthorized = true;
      cb(unauthorizedError);
    } else if (response.statusCode === 404) {
      const contactNotFoundErr = Error("Contact not found");
      contactNotFoundErr.contactNotFound = true;
      cb(contactNotFoundErr);
    } else if (response.statusCode !== 200) {
      console.log("Failed to get contact", response.statusCode);
      cb(new Error("Failed to get contact"));
    } else {
      cb(null, body); // this is actually err, contact in the other file
     }
  })
}
