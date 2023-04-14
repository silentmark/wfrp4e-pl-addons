const path = require('path');
const fs = require('fs-extra');

function foundryConfig(moduleId) {
  const configPath = path.resolve(process.cwd(), 'foundryconfig.json');
  let config;

  if (fs.existsSync(configPath)) {
      config = fs.readJSONSync(configPath);
  }

  let foundryPath
  if (config?.path) {
    foundryPath = path.join(config.path, "modules", moduleId)
  }

  console.log("Foundry Path: " + foundryPath)
  return foundryPath
}

exports.modulePath = foundryConfig