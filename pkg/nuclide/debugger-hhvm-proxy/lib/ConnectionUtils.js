'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import {log, logError} from './utils';
import {uriToPath} from './helpers';

import type {Socket} from 'net';
import type {ConnectionConfig} from './DbgpConnector';

export function failConnection(socket: Socket, errorMessage: string): void {
  log(errorMessage);
  socket.end();
  socket.destroy();
}

export function isCorrectConnection(config: ConnectionConfig, message: Object): boolean {
  const {pid, idekeyRegex, scriptRegex} = config;
  if (!message || !message.init || !message.init.$) {
    logError('Incorrect init');
    return false;
  }

  const init = message.init;
  if (!init.engine || !init.engine || !init.engine[0] || init.engine[0]._ !== 'xdebug') {
    logError('Incorrect engine');
    return false;
  }

  const attributes = init.$;
  if (attributes.xmlns !== 'urn:debugger_protocol_v1'
    || attributes['xmlns:xdebug'] !== 'http://xdebug.org/dbgp/xdebug'
    || attributes.language !== 'PHP') {
    logError('Incorrect attributes');
    return false;
  }

  return (!pid || attributes.appid === String(pid)) &&
    (!idekeyRegex || new RegExp(idekeyRegex).test(attributes.idekey)) &&
    (!scriptRegex || new RegExp(scriptRegex).test(uriToPath(attributes.fileuri)));
}
