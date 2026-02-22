// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// Resolve the CSS path absolutely (important for Windows)
const globalCSSPath = path.resolve(__dirname, "global.css");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: globalCSSPath,
});