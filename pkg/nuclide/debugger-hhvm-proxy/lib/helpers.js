'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import logger from './utils';
import {parse} from 'shell-quote';

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
    logger.logErrorAndThrow(`unexpected file protocol. Got: ${components.protocol}`);
  }
  return components.pathname || '';
}

/**
 * Used to start the HHVM instance that the dummy connection connects to so we can evaluate
 * expressions in the REPL.
 */
export function launchScriptForDummyConnection(scriptPath: string): child_process$ChildProcess {
  return launchPhpScriptWithXDebugEnabled(scriptPath);
}

/**
 * Used to start an HHVM instance running the given script in debug mode.
 */
export function launchScriptToDebug(
  scriptPath: string,
  sendToOutputWindow: (text: string) => void,
): Promise<void> {
  return new Promise((resolve, _) => {
    launchPhpScriptWithXDebugEnabled(scriptPath, text => {
      sendToOutputWindow(text);
      resolve();
    });
  });
}

function launchPhpScriptWithXDebugEnabled(
  scriptPath: string,
  sendToOutputWindowAndResolve?: (text: string) => void,
): child_process$ChildProcess {
  const child_process = require('child_process');
  const scriptArgv = parse(scriptPath);
  const args = ['-c', 'xdebug.ini', ...scriptArgv];
  // TODO[jeffreytan]: make hhvm path configurable so that it will
  // work for non-FB environment.
  const proc = child_process.spawn('/usr/local/hphpi/bin/hhvm', args);
  logger.log(`child_process(${proc.pid}) spawned with xdebug enabled for: ${scriptPath}`);

  proc.stdout.on('data', chunk => {
    // stdout should hopefully be set to line-buffering, in which case the
    // string would come on one line.
    const block: string = chunk.toString();
    const output = `child_process(${proc.pid}) stdout: ${block}`;
    logger.log(output);
  });
  proc.on('error', err => {
    logger.log(`child_process(${proc.pid}) error: ${err}`);
    if (sendToOutputWindowAndResolve != null) {
      sendToOutputWindowAndResolve(
        `The process running script: ${scriptPath} encountered an error: ${err}`
      );
    }
  });
  proc.on('exit', code => {
    logger.log(`child_process(${proc.pid}) exit: ${code}`);
    if (sendToOutputWindowAndResolve != null) {
      sendToOutputWindowAndResolve(`Script: ${scriptPath} exited with code: ${code}`);
    }
  });
  return proc;
}
