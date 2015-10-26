'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


function log(message: string) {
  var logger = require('nuclide-logging').getLogger();
  logger.info('hhvm debugger: ' + message);
}

function logError(message: string) {
  var logger = require('nuclide-logging').getLogger();
  logger.error('hhvm debugger: ' + message);
}

function logErrorAndThrow(message: string) {
  logError(message);
  logError(new Error().stack);
  throw new Error(message);
}

function base64Decode(value: string): string {
  return new Buffer(value, 'base64').toString();
}

function makeDbgpMessage(message: string): string {
  return String(message.length) + '\x00' + message + '\x00';
}

function makeMessage(obj: Object, body: ?string): string {
  body = body || '';
  var result = '<?xml version="1.0" encoding="iso-8859-1"?>' +
    '<response xmlns="urn:debugger_protocol_v1" xmlns:xdebug="http://xdebug.org/dbgp/xdebug"';
  for (var key in obj) {
    result += ' ' + key + '="' + obj[key] + '"';
  }
  result += '>' + body + '</response>';
  return makeDbgpMessage(result);
}

function pathToUri(path: string): string {
  return 'file://' + path;
}

function uriToPath(uri: string): string {
  var components = require('url').parse(uri);
  // Some filename returned from hhvm does not have protocol.
  if (components.protocol !== 'file:' && components.protocol !== null) {
    logErrorAndThrow('unexpected file protocol. Got: ' + components.protocol);
  }
  return components.pathname;
}

var DUMMY_FRAME_ID = 'Frame.0';

module.exports = {
  log,
  logError,
  logErrorAndThrow,
  makeMessage,
  makeDbgpMessage,
  base64Decode,
  pathToUri,
  uriToPath,
  DUMMY_FRAME_ID,
};
