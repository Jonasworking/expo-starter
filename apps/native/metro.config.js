const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const { withMonicon } = require("@monicon/metro");

/** @type {import('expo/metro-config').MetroConfig} */
let config = getDefaultConfig(__dirname);

config = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});

config = withMonicon(config);

// Web fix:
//
// 1. Alias `react-native` → `react-native-web`. Expo CLI ships this alias in
//    its withMetroMultiPlatform layer, but it gets bypassed here because
//    Uniwind's withUniwindConfig captures the resolver before Expo's outer
//    wrap is applied. We restate the alias on top so it's guaranteed.
//
// 2. When react-native-web internally imports its own components
//    (e.g. `vendor/FlatList` → `exports/View`), Uniwind's webResolver
//    replaces those with `uniwind/components/X`. Uniwind's wrappers then
//    re-import `react-native` and create a circular dependency: react-native
//    -web is still mid-evaluation when uniwind reads back into it, so
//    `_FlatList.default` ends up undefined and the lazy getter on rnw's
//    `FlatList` export throws "Cannot read properties of undefined (reading
//    'default')". We break the cycle by short-circuiting requests whose
//    `originModulePath` is inside react-native-web — those go straight to
//    Metro's base resolver, skipping Uniwind's webResolver entirely.
const RNW_PATH_FRAGMENT = `${path.sep}react-native-web${path.sep}`;
const previousResolveRequest = config.resolver.resolveRequest;

const baseResolve = (context, moduleName, platform) =>
  previousResolveRequest
    ? previousResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);

config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (platform === "web") {
      if (moduleName === "react-native") {
        return baseResolve(context, "react-native-web", platform);
      }
      if (context.originModulePath?.includes(RNW_PATH_FRAGMENT)) {
        // Bypass Uniwind's webResolver for RNW-internal imports.
        return context.resolveRequest(context, moduleName, platform);
      }
    }

    return baseResolve(context, moduleName, platform);
  },
};

module.exports = config;
