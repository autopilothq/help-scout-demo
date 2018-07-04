const fs = require('fs');

module.exports = function getFieldSettings(apiKey, cb) {
  fs.readFile(`preferences/${apiKey}-preferences.json`, 'utf8', (err, data) => {
    // if no file exists, make an empty file
    if (err && err.code == "ENOENT") {
      fs.writeFile(`preferences/${apiKey}-preferences.json`, "", 'utf8', (err) => {
        if (err) {
          return cb(err);
        }
        console.log("The file was made!");
      });
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
      cb(null, fields);
    } else {
      fields = "";
      cb(null, fields);
    }
  });
}
