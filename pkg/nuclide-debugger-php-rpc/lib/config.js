'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfig = getConfig;
exports.setConfig = setConfig;
exports.clearConfig = clearConfig;

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultConfig = {
  xdebugAttachPort: 9000,
  xdebugLaunchingPort: 10112,
  logLevel: 'INFO',
  targetUri: '',
  phpRuntimePath: '/usr/local/bin/php',
  phpRuntimeArgs: '',
  dummyRequestFilePath: 'php_only_xdebug_request.php',
  stopOneStopAll: false
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

let config = defaultConfig;

function getConfig() {
  return config;
}

function setConfig(newConfig) {
  config = Object.assign({}, newConfig);
  (_utils || _load_utils()).default.debug(`Config was set to ${JSON.stringify(config)}`);
}

function clearConfig() {
  config = defaultConfig;
}