const express = require('express');
const cors = require('cors');
const request = require('request-promise');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const fs = require('fs');

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
    if (err) {
      fs.writeFile(`preferences/${apiKey}-preferences.json`, "", 'utf8', (err) => {
        if (err) {
          return console.log(err);
        }
        console.log("The file was made!");
      });
    }
    if (data) {
      obj = JSON.parse(data);
      res.json(obj);
    }
  });
});

app.post('/api/custom-fields', async (req, res) => {
  const apiKey = req.body.apiKey;
  // use the apiKey to get custom fields by posting to our api
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

  fs.writeFile(`preferences/${apiKey}-preferences.json`, content, 'utf8', (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
  res.json({success : true});

});

app.listen(port, () => console.log(`Listening on port ${port}`));
