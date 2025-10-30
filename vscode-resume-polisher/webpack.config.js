//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode',
    playwright: 'commonjs playwright',
    'playwright-core': 'commonjs playwright-core',
    'chromium-bidi': 'commonjs chromium-bidi',
    'chromium-bidi/lib/cjs/bidiMapper/BidiMapper': 'commonjs chromium-bidi/lib/cjs/bidiMapper/BidiMapper',
    'chromium-bidi/lib/cjs/cdp/CdpConnection': 'commonjs chromium-bidi/lib/cjs/cdp/CdpConnection',
    electron: 'commonjs electron',
    bufferutil: 'commonjs bufferutil',
    'utf-8-validate': 'commonjs utf-8-validate'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
};

module.exports = config;
