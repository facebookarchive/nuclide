'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeLogging = initializeLogging;
exports.windowMessage = windowMessage;
exports.windowStatusMessage = windowStatusMessage;
exports.addDbMessage = addDbMessage;

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _vscodeLanguageserver;

function _load_vscodeLanguageserver() {
  return _vscodeLanguageserver = require('vscode-languageserver');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../../nuclide-logging');
}

var _uuid;

function _load_uuid() {
  return _uuid = _interopRequireDefault(require('uuid'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generate an instanceid to avoid collisions after restart.
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

const instanceId = (_uuid || _load_uuid()).default.v4();
let nextRequestId = 0;
function generateId() {
  // Pick a prefix that will not collide with cquery.
  return `nuclide-cquery-${instanceId}-${nextRequestId++}`;
}

function initializeLogging(connection) {
  (0, (_nuclideLogging || _load_nuclideLogging()).setupLoggingService)();
  // Log to stderr to avoid polluting the JsonRpc stdout.
  // Also send errors to the client's log.
  (_log4js || _load_log4js()).default.configure({
    appenders: [{ type: 'stderr' }, {
      type: 'logLevelFilter',
      level: 'WARN',
      appender: {
        connection,
        type: require.resolve('../../../nuclide-lsp-implementation-common/connectionConsoleAppender')
      }
    }]
  });
}

// Construct a LSP window/logMessage of given text and severity.
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
}

// Construct a LSP window/logMessage to add given compilation database.
function addDbMessage(databaseDirectory) {
  return {
    jsonrpc: '2.0',
    method: '$cquery/addCompilationDb',
    params: {
      databaseDirectory
    }
  };
}