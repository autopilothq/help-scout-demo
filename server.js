const express = require('express');
const async = require('async');
const cors = require('cors');
const request = require('request');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const getContactFromApi = require('./lib/getContactFromApi');
const getFieldSettings = require('./lib/getFieldSettings');
const config = require('./config/index.js');
const port = config.port;
const mappingObject = config.mappingObject;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cors());

app.post('/help-scout/api/saved-fields', async (req, res) => {
  let apiKey = req.body.apiKey;
  let obj;
  fs.readFile(__dirname + '/' + `preferences/${apiKey}-preferences.json`, 'utf8', (err, data) => {
    // if no file exists, make an empty file
    if (err && err.code == "ENOENT") {
      fs.writeFile(__dirname + '/' + `preferences/${apiKey}-preferences.json`, "", 'utf8', (err) => {
        if (err) {
          res.statusCode = 500;
          console.log("Could not create settings file", err);
          return res.end();
        }
        console.log("New settings file made.");
      });
    } else if (err) {
      res.statusCode = 500;
      console.log("Could not read file", err);
      return res.end();
    }

    if (data) {
      try {
        obj = JSON.parse(data);
        res.json(obj);
      } catch (err) {
        res.statusCode = 400;
        res.send('Invalid json');
      }
    }
  });
});

app.post('/help-scout/api/custom-fields', async (req, res) => {
  let apiKey = req.body.apiKey;
  let customFields = [];

  const reqOpts = {
    url: `https://api2.autopilothq.com/v1/contacts/custom_fields`,
    json: true,
    headers: {
      'Content-Type': 'application/json',
      'autopilotapikey': apiKey
    },
  };

  request(reqOpts, (err, response, body) => {
    if (err) {
      res.statusCode = 500;
      console.log("Could not get custom fields", err);
      return res.end()
    } else if (response.statusCode !== 200) {
      console.log("Got status code from api", response.statusCode);
      res.statusCode = 401;
      return res.end()
    } else {
      Array.from(body).forEach ( (customField) => {
        customFields.push(customField.name);
      });
      res.json(customFields);
    }
  });
});

app.post('/help-scout/api/settings', async (req, res) => {
  let fieldsToSave = req.body.fieldsToSave;
  let apiKey = req.body.apiKey;
  const content = JSON.stringify(fieldsToSave);
// this is a persistence example and not intended to be used in production
  fs.writeFile(__dirname + '/' + `preferences/${apiKey}-preferences.json`, content, 'utf8', (err) => {
    if (err) {
      res.statusCode = 500;
      console.log("Could not save settings", err);
      return res.end();
    }
    console.log("Settings saved.");
  });
  res.json({success : true});
});

app.post('/help-scout/endpoint', async (req, res) => {
  let email = req.body.customer.email;
  let json = {};
  let selectedFields = [];
  let contactDoc;
  let response = {};
  let fields;
  let apiKey = config.apiKey;
  let markup = "";

  async.waterfall(
    [
      // request the contact details from the api
      (cb) => {
        getContactFromApi(email, (err, contact) => {
          if (err) {
            return cb(err);
          }
          contactDoc = contact; // contact here is the body we cb()'ed in other file
          cb();
        });
      },

      // get the settings from the json file
      (cb) => {
        getFieldSettings(apiKey, (err, fieldSettings) => {
          if (err) {
            return cb(err);
          }
          let key;
          // use a mapping object to make the standard field names human-readable
          const setStandardField = (field) => {
            key = field;
            if (mappingObject[key]) {
              selectedFields.push([mappingObject[key], contactDoc[field]]);
            }
            else if (field === "created_at") {
              let date = new Date(contactDoc[field]).toISOString().substr(0, 10);
              dArr = date.split("-");
              let formattedDate = dArr[2]+ "/" +dArr[1]+ "/" +dArr[0].substring(2);
              selectedFields.push(["Created At", formattedDate]);
            }
            else if (field === "updated_at") {
              let date = new Date(contactDoc[field]).toISOString().substr(0, 10);
              dArr = date.split("-");
              let formattedDate = dArr[2]+ "/" +dArr[1]+ "/" +dArr[0].substring(2);
              selectedFields.push(["Updated At", formattedDate]);
            }
            else {
              selectedFields.push([field, contactDoc[field]]);
            }
          }

          const setCustomField = (field) => {
            let customFields = contactDoc.custom_fields;
            if (customFields && customFields.length !== 0) {
              let customField;
              for (let i = 0; i < customFields.length; i++) {
                customField = customFields[i];
                if (customField.kind.split(" ").join("") === field && customField.fieldType === "date") {
                  let d = new Date(customField.value);
                    if (isNaN(d.getTime())) {
                      let formattedDate = customField.value;
                    } else {
                    let date = new Date(customField.value).toISOString().substr(0, 10);
                    dArr = date.split("-");
                    let formattedDate = dArr[2]+ "/" +dArr[1]+ "/" +dArr[0].substring(2);
                    selectedFields.push([customField.kind, formattedDate]);
                  }
                }
                else if (customField.kind.split(" ").join("") === field) {
                  selectedFields.push([customField.kind, customField["value"]]);
                }
              }
            }
          }

          if (!fieldSettings) {
            markup = "You have not chosen any fields to display."
          }

          // look for the requested fields in the contact response body
          if (fieldSettings) {
            fieldSettings.forEach( (field) => {
              if (field in contactDoc) {
                setStandardField(field);
              } else {
                setCustomField(field);
              }
            })
          }

          cb();
        });
      },

      // generate the response
      (cb) => {
        if (selectedFields) {
          selectedFields.forEach( (field) => {
            markup = markup + `<li class=\"c-sb-list-item\">
            <span class=\"c-sb-list-item__label\">
            ${field[0]}
            <span class=\"c-sb-list-item__text\">${field[1]}</span>
            </span>
            </li>`
          })
        }
        response.html = `<ul class=\"c-sb-list c-sb-list--two-line\">
          ${markup}
        </ul>`;

        cb();
      }
    ], (err) => {
      if (err) {
        res.statusCode = 500;
        console.log("Unable to generate html", err);
        return res.end()
      } else {
        res.json(response);
      }
  });
})

app.listen(port, () => console.log(`Listening on port ${port}`));
