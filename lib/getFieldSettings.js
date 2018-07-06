const fs = require('fs');

module.exports = function getFieldSettings(apiKey, cb) {
  fs.readFile(__dirname + '/../' + `preferences/${apiKey}-preferences.json`, 'utf8', (err, data) => {
    if (err && err.code == "ENOENT") {
      // no settings reply with an empty array
      return cb null, []
    } else if (err) {
      return cb(err);
    }
    if (data) {
      try {
        fields = JSON.parse(data);
      }
      catch(err) {
        return cb(err);
      }
      if (Array.isArray(fields)){
        return cb(null, fields);
      }
    }
    return cb(Error("Error settings document malformed or not an array"));
  });
}
