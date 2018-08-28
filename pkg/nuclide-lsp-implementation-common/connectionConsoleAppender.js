"use strict";

function _log4js() {
  const data = _interopRequireDefault(require("log4js"));

  _log4js = function () {
    return data;
  };

  return data;
}

function _vscodeLanguageserver() {
  const data = require("vscode-languageserver");

  _vscodeLanguageserver = function () {
    return data;
  };

  return data;
}

function _protocol() {
  const data = require("../nuclide-vscode-language-service-rpc/lib/protocol");

  _protocol = function () {
    return data;
  };

  return data;
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
function getMessageType(levelStr) {
  switch (levelStr) {
    case 'ERROR':
      return _protocol().MessageType.Error;

    case 'WARN':
      return _protocol().MessageType.Warning;

    case 'INFO':
      return _protocol().MessageType.Info;

    default:
      return _protocol().MessageType.Log;
  }
}

function appender(config) {
  const {
    connection
  } = config; // eslint-disable-next-line flowtype/no-weak-types

  return loggingEvent => {
    // $FlowFixMe: type log4js.layouts
    const message = _log4js().default.layouts.basicLayout(loggingEvent);

    if (loggingEvent.level.level >= _log4js().default.levels.INFO.level) {
      connection.console.log(message);
    }

    connection.telemetry.logEvent({
      type: getMessageType(loggingEvent.level.levelStr),
      message
    });
  };
} // eslint-disable-next-line nuclide-internal/no-commonjs


module.exports.configure = module.exports.appender = appender;