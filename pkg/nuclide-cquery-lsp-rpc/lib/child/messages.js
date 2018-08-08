"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeLogging = initializeLogging;
exports.windowMessage = windowMessage;
exports.windowStatusMessage = windowStatusMessage;
exports.addDbMessage = addDbMessage;

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

function _nuclideLogging() {
  const data = require("../../../nuclide-logging");

  _nuclideLogging = function () {
    return data;
  };

  return data;
}

function _uuid() {
  const data = _interopRequireDefault(require("uuid"));

  _uuid = function () {
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
// Generate an instanceid to avoid collisions after restart.
const instanceId = _uuid().default.v4();

let nextRequestId = 0;

function generateId() {
  // Pick a prefix that will not collide with cquery.
  return `nuclide-cquery-${instanceId}-${nextRequestId++}`;
}

function initializeLogging(connection) {
  (0, _nuclideLogging().setupLoggingService)(); // Log to stderr to avoid polluting the JsonRpc stdout.
  // Also send errors to the client's log.

  _log4js().default.configure({
    appenders: [{
      type: 'stderr'
    }, {
      type: 'logLevelFilter',
      level: 'WARN',
      appender: {
        connection,
        type: require.resolve("../../../nuclide-lsp-implementation-common/connectionConsoleAppender")
      }
    }]
  });
} // Construct a LSP window/logMessage of given text and severity.


function windowMessage(type, message) {
  return {
    jsonrpc: '2.0',
    method: 'window/logMessage',
    params: {
      message,
      type
    }
  };
}

function windowStatusMessage(params) {
  return {
    jsonrpc: '2.0',
    method: 'window/showStatus',
    id: generateId(),
    params
  };
} // Construct a LSP window/logMessage to add given compilation database.


function addDbMessage(databaseDirectory) {
  return {
    jsonrpc: '2.0',
    method: '$cquery/addCompilationDb',
    params: {
      databaseDirectory
    }
  };
}