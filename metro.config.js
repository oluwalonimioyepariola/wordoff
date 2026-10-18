// Keep Metro out of the landing page (web/ is its own Next.js package).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.blockList = [/[\\/]web[\\/].*/];

module.exports = config;
