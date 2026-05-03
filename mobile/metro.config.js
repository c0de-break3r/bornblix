const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
let config = getDefaultConfig(__dirname);
config = withNativeWind(config, { input: './src/global.css' });

// framer-motion (via moti) + tslib "import" exports resolve to modules/index.js, which
// expects a default from tslib.js; Metro interop leaves it undefined → __extends crash.
const tslibCjs = path.join(path.dirname(require.resolve('tslib/package.json')), 'tslib.js');
const resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return { type: 'sourceFile', filePath: tslibCjs };
  }
  if (resolveRequest) {
    return resolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
