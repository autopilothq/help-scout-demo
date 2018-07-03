const express = require('express');
const async = require('async');
const cors = require('cors');
const request = require('request-promise');
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

app.post('/api/saved-fields', async (req, res) => {
  let apiKey = req.body.apiKey;
  let obj;
  fs.readFile(`preferences/${apiKey}-preferences.json`, 'utf8', (err, data) => {
    // if no file exists, make an empty file
    if (err && err.code == "ENOENT") {
      fs.writeFile(`preferences/${apiKey}-preferences.json`, "", 'utf8', (err) => {
        if (err) {
          res.statusCode = 500;
          console.log(err);
          return res.end();
        }
        console.log("New settings file made.");
      });
    } else if (err) {
      res.statusCode = 500;
      console.log(err);
      return res.end();
    }
    if (data) {
      obj = JSON.parse(data);
      res.json(obj);
    }
  });
});

app.post('/api/custom-fields', async (req, res) => {
  let apiKey = req.body.apiKey;
  let customFields = [];

  request({
      url: `https://api2.autopilothq.com/v1/contacts/custom_fields`,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'autopilotapikey': apiKey
      },
    }, (err, response, body) => {
      if (err) {
        res.statusCode = 500;
        console.log(err);
        return res.end()
      } else if (res.statusCode !== 200) {
        res.statusCode = 401;
        console.log(err);
        return res.end()
      } else {
        Array.from(body).forEach ( (customField) => {
          customFields.push(customField.name);
        })
      }
    }).catch((err) => {
      if (err.statusCode === 401) {
        res.end()
      }
    }).then(() => {
      res.json(customFields);
    });
});

app.post('/api/settings', async (req, res) => {
  let fieldsToSave = req.body.fieldsToSave;
  let apiKey = req.body.apiKey;
  const content = JSON.stringify(fieldsToSave);
// this is a persistence example and not intended to be used in production
  fs.writeFile(`preferences/${apiKey}-preferences.json`, content, 'utf8', (err) => {
    if (err) {
      res.statusCode = 500;
      console.log(err);
      return res.end();
    }
    console.log("Settings saved.");
  });
  res.json({success : true});
});

app.post('/endpoint', async (req, res) => {
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
            if (contactDoc.custom_fields.length !== 0) {
              for (let i = 0; i < contactDoc.custom_fields.length; i++) {
                if (contactDoc.custom_fields[i].kind.split(" ").join("") === field && contactDoc.custom_fields[i].fieldType === "date") {
                  let d = new Date(contactDoc.custom_fields[i].value);
                    if (isNaN(d.getTime())) {
                      let formattedDate = contactDoc.custom_fields[i].value;
                    } else {
                    let date = new Date(contactDoc.custom_fields[i].value).toISOString().substr(0, 10);
                    dArr = date.split("-");
                    let formattedDate = dArr[2]+ "/" +dArr[1]+ "/" +dArr[0].substring(2);
                    selectedFields.push([contactDoc.custom_fields[i].kind, formattedDate]);
                  }
                }
                else if (contactDoc.custom_fields[i].kind.split(" ").join("") === field) {
                  selectedFields.push([contactDoc.custom_fields[i].kind, contactDoc.custom_fields[i]["value"]]);
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
        console.log(err);
        return res.end()
      } else {
        res.json(response);
      }

  });
})

app.listen(port, () => console.log(`Listening on port ${port}`));
