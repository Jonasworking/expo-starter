// Custom app entry. Runs before expo-router/entry so that on web we can
// fully load react-native-web BEFORE Uniwind's components (which transitively
// import "react-native") get a chance to evaluate. This works together with
// the resolveRequest hook in metro.config.js to avoid the circular import
// that previously left RN exports like FlatList undefined at lazy-getter
// access time.
const { Platform } = require("react-native");

if (Platform.OS === "web") {
  require("react-native-web");
}

require("expo-router/entry");
