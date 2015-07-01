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

/**
 * Convert xml to JS. Uses the xml2js package.
 * xml2js has a rather ... unique ... callback based API for a
 * synchronous operation. This functions purpose is to give a reasonable API.
 *
 * Format of the result:
 * Children become fields.
 * Multiple children of the same name become arrays.
 * Attributes become children of the '$' member
 * Body becomes either a string (if no attributes or children)
 * or the '_' member.
 * CDATA becomes an array containing a string, or just a string.
 *
 * Throws if the input is not valid xml.
 */
function parseXml(xml: string): mixed {
  var errorValue;
  var resultValue;
  require('xml2js').parseString(xml, (error, result) => {
    errorValue = error;
    resultValue = result;
  });
  if (errorValue !== null) {
    throw new Error('Error ' + JSON.stringify(errorValue) + ' parsing xml: ' + xml);
  }
  return resultValue;
}

function base64Decode(value: string): string {
  return new Buffer(value, 'base64').toString();
}

/**
 * Server messages are formatted as a string containing:
 * length <NULL> xml-blob <NULL>
 * Returns the xml-blob converted to a JS object
 *
 * Throws if the message is malformatted.
 */
function parseDbgpMessage(message: string): string {

  var components = message.split('\x00');
  if (components.length !== 3) {
    throw new Error('Error: Server message format expected 3 components. Got ' + components.length);
  }
  var length = Number(components[0]);
  var value = components[1];
  if (value.length !== length) {
    throw new Error('Error: Server message expected length ' + length + ' got length ' +
      value.length);
  }

  var json = parseXml(value);
  log('Translating server message result json: ' + JSON.stringify(json));
  return json;
}

function makeDbgpMessage(message: string): string {
  return String(message.length) + '\x00' + message + '\x00';
}

function pathToUri(path: string): string {
  return 'file://' + path;
}

function uriToPath(uri: string): string {
  var components = require('url').parse(uri);
  if (components.protocol !== 'file:') {
    logErrorAndThrow('unexpected file protocol. Got: ' + components.protocol);
  }
  return components.pathname;
}

var DUMMY_FRAME_ID = 'Frame.0';

module.exports = {
  log,
  logError,
  logErrorAndThrow,
  makeDbgpMessage,
  parseDbgpMessage,
  parseXml,
  base64Decode,
  pathToUri,
  uriToPath,
  DUMMY_FRAME_ID,
};
