# help-scout-demo

Help-scout-demo is a prototype of the proposed settings view/panel of a custom app for Autopilot in Help Scout.

The purpose of the demo is to show Help Scout the basic UI/functionality of the settings view so they can implement on their side. Functionality includes:

- Accept API key input from user
- Show Autopilot standard fields as checkboxes
- Based on API key input, show Autopilot custom fields as checkboxes
- Save the ticked checkboxes i.e. the fields the user would like to see in their Help Scout custom app (currently just stored as separate .json files)
- Retrieve saved settings on API key form submission

This demo could potentially be repurposed for other integrations.

If questions, please ask Mandy, Hunter or Mike.

NB: The .json files storing specific user settings are currently using api keys as the identifier. This should be replaced with an identifier that Help Scout stores.

### Incoming requests

The server is to run constantly to accept these incoming post requests:

```
/api/saved-fields -> to retrieve saved settings
/api/custom-fields -> to retrieve the user's custom fields
/api/settings -> to save the user's settings to .json files
```

### Use (development)

```bash
$ git clone https://github.com/autopilothq/help-scout-demo
$ cd help-scout-demo
$ npm install
$ cd client
$ npm install
$ cd ..
$ node server.js
Make a folder called preferences inside the root directory
$ npm run client
```

### Building after deployment

The server is constantly serving the endpoints via nginx. Navigate to the directory via:
```bash
 $ ssh manager
 $ ssh stats-and-tools
 $ cd help-scout-demo
 $ git pull
 $ npm install
```
To run the client:
```bash
 $ cd client
 $ npm run build
 ```
 
### Technologies

This was built with a React front end and Node backend, however we are somewhat agnostic as to how the final version is implemented by Help Scout.
