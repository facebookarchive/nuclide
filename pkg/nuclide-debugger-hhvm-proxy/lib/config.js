Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getConfig = getConfig;
exports.setConfig = setConfig;
exports.clearConfig = clearConfig;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var defaultConfig = {
  xdebugAttachPort: 9000,
  xdebugLaunchingPort: 10112,
  logLevel: 'INFO',
  targetUri: '',
  phpRuntimePath: '/usr/local/bin/php',
  dummyRequestFilePath: 'php_only_xdebug_request.php'
};

var config = defaultConfig;

function getConfig() {
  return config;
}

function setConfig(newConfig) {
  config = _extends({}, newConfig);
  (_utils2 || _utils()).default.log('Config was set to ' + JSON.stringify(config));
}

function clearConfig() {
  config = defaultConfig;
}