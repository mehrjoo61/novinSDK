const path = require("path");
const { merge } = require("webpack-merge");
const webpack = require("webpack");

const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "sdk.js",
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      API_URL: "http://localhost:5000",
    }),
  ],
});
