'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfig = getConfig;
exports.isValidRegex = isValidRegex;
exports.getSessionConfig = getSessionConfig;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const DEBUGGER_LOGGER_CATEGORY = 'nuclide-debugger-php';
exports.default = (0, (_log4js || _load_log4js()).getLogger)(DEBUGGER_LOGGER_CATEGORY);
function getConfig() {
  return (_featureConfig || _load_featureConfig()).default.get('nuclide-debugger-php');
}

// TODO: Move this to nuclide-commons.
function isValidRegex(value) {
  if (value == null) {
    return false;
  }
  try {
    RegExp(value);
  } catch (e) {
    return false;
  }
  return true;
}

function validateConfig(config) {
  const { attachScriptRegex } = config;
  if (!isValidRegex(attachScriptRegex)) {
    if (!(attachScriptRegex != null)) {
      throw new Error('Invariant violation: "attachScriptRegex != null"');
    }

    throw Error(`config scriptRegex is not a valid regular expression: ${attachScriptRegex}`);
  }

  if (!isValidRegex(config.idekeyRegex)) {
    if (!(config.idekeyRegex != null)) {
      throw new Error('Invariant violation: "config.idekeyRegex != null"');
    }

    throw Error(`config idekeyRegex is not a valid regular expression: ${config.idekeyRegex}`);
  }
}

function getSessionConfig(targetUri, isLaunch) {
  const config = getConfig();
  validateConfig(config);
  const sessionConfig = {
    xdebugAttachPort: config.xdebugAttachPort,
    xdebugLaunchingPort: config.xdebugLaunchingPort,
    targetUri,
    logLevel: config.logLevel,
    endDebugWhenNoRequests: false,
    phpRuntimePath: config.phpRuntimePath,
    phpRuntimeArgs: config.phpRuntimeArgs,
    dummyRequestFilePath: 'php_only_xdebug_request.php',
    stopOneStopAll: config.stopOneStopAll,
    attachScriptRegex: config.attachScriptRegex,
    idekeyRegex: config.idekeyRegex
  };
  if (isLaunch) {
    sessionConfig.xdebugAttachPort = config.xdebugLaunchingPort;
  }
  return sessionConfig;
}