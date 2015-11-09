'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {log, logErrorAndThrow} from './utils';
import type {ChildProcess} from 'child_process';

export const DUMMY_FRAME_ID = 'Frame.0';

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

export function launchPhpScriptWithXDebugEnabled(scriptPath: string): ChildProcess {
  const child_process = require('child_process');
  const args = ['-c', 'xdebug.ini', scriptPath];
  // TODO[jeffreytan]: make hhvm path configurable so that it will
  // work for non-FB environment.
  const proc = child_process.spawn('/usr/local/hphpi/bin/hhvm', args);
  log(`child_process(${proc.pid}) spawned with xdebug enabled for: ${scriptPath}`);

  proc.stdout.on('data', chunk => {
    // stdout should hopefully be set to line-buffering, in which case the
    // string would come on one line.
    const block: string = chunk.toString();
    const output = `child_process(${proc.pid}) stdout: ${block}`;
    log(output);
  });
  proc.on('error', err => {
    log(`child_process(${proc.pid}) error: ${err}`);
  });
  proc.on('exit', code => {
    log(`child_process(${proc.pid}) exit: ${code}`);
  });
  return proc;
}
