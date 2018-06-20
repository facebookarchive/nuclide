'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.windowMessage = windowMessage;
exports.addDbMessage = addDbMessage;


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

// Construct a LSP window/logMessage to add given compilation database.
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

function addDbMessage(databaseDirectory) {
  return {
    jsonrpc: '2.0',
    method: '$cquery/addCompilationDb',
    params: {
      databaseDirectory
    }
  };
}