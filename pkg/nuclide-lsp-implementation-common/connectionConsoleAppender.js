'use strict';

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _vscodeLanguageserver;

function _load_vscodeLanguageserver() {
  return _vscodeLanguageserver = require('vscode-languageserver');
}

var _protocol;

function _load_protocol() {
  return _protocol = require('../nuclide-vscode-language-service-rpc/lib/protocol');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getMessageType(levelStr) {
  switch (levelStr) {
    case 'ERROR':
      return (_protocol || _load_protocol()).MessageType.Error;
    case 'WARN':
      return (_protocol || _load_protocol()).MessageType.Warning;
    case 'INFO':
      return (_protocol || _load_protocol()).MessageType.Info;
    default:
      return (_protocol || _load_protocol()).MessageType.Log;
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function appender(config) {
  const { connection } = config;

  // eslint-disable-next-line flowtype/no-weak-types
  return loggingEvent => {
    // $FlowFixMe: type log4js.layouts
    const message = (_log4js || _load_log4js()).default.layouts.basicLayout(loggingEvent);
    if (loggingEvent.level.level >= (_log4js || _load_log4js()).default.levels.INFO.level) {
      connection.console.log(message);
    }
    connection.telemetry.logEvent({
      type: getMessageType(loggingEvent.level.levelStr),
      message
    });
  };
}

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports.configure = module.exports.appender = appender;