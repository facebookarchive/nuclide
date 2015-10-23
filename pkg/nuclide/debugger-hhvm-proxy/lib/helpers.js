'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export function base64Decode(value: string): string {
  return new Buffer(value, 'base64').toString();
}

export function makeDbgpMessage(message: string): string {
  return String(message.length) + '\x00' + message + '\x00';
}

export function makeMessage(obj: Object, body: ?string): string {
  body = body || '';
  let result = '<?xml version="1.0" encoding="iso-8859-1"?>' +
    '<response xmlns="urn:debugger_protocol_v1" xmlns:xdebug="http://xdebug.org/dbgp/xdebug"';
  for (const key in obj) {
    result += ' ' + key + '="' + obj[key] + '"';
  }
  result += '>' + body + '</response>';
  return makeDbgpMessage(result);
}

export function pathToUri(path: string): string {
  return 'file://' + path;
}

export function uriToPath(uri: string): string {
  const components = require('url').parse(uri);
  // Some filename returned from hhvm does not have protocol.
  if (components.protocol !== 'file:' && components.protocol !== null) {
    logErrorAndThrow('unexpected file protocol. Got: ' + components.protocol);
  }
  return components.pathname;
}

export const DUMMY_FRAME_ID = 'Frame.0';
