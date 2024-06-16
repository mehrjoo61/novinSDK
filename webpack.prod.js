const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");

const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "production",
  output: {
    path: path.resolve(__dirname, "./dist/production"),
    filename: "novinSDK.js",
  },
  // plugins: [
  //   new webpack.EnvironmentPlugin({
  //     API_URL: "https://api.cdp.widgeto.ir",
  //   }),
  // ],
});
