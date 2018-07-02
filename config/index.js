const loadConfig = (file) => {
  let cf;
  try {
    cf = require(file);
  } catch (err) {
    if (/Cannot find module/.test(err)) {
      return;
    } else {
      log.error(`ConfigFile ${file} failed to load`, err);
    }
  }
  return cf;
};

// start with defaults and overwrite
const config = require('./defaults.js');

let localConfig = loadConfig("./localConfig.js");
if (!localConfig) {
  localConfig = loadConfig("./prodConfig.js");
}

// override configuration settings with local values
for (let k of Object.keys(localConfig || {})) { 
  config[k] = localConfig[k];
}

module.exports = config;
