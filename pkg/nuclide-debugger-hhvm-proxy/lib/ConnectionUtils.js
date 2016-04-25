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
import {getConfig} from './config';
import {launchScriptForDummyConnection, uriToPath} from './helpers';
import {fsPromise} from '../../nuclide-commons';
import path from 'path';

import type {Socket} from 'net';

async function getHackRoot(filePath: string): Promise<?string> {
  return await fsPromise.findNearestFile('.hhconfig', filePath);
}

export async function setRootDirectoryUri(directoryUri: string): Promise {
  const hackRootDirectory = await getHackRoot(directoryUri);
  logger.log(`setRootDirectoryUri: from ${directoryUri} to ${hackRootDirectory}`);
  // TODO: make xdebug_includes.php path configurable from hhconfig.
  const hackDummyRequestFilePath = path.join(
    (hackRootDirectory ? hackRootDirectory : ''),
    '/scripts/xdebug_includes.php'
  );

  // Use hackDummyRequestFilePath if possible.
  if (await fsPromise.exists(hackDummyRequestFilePath)) {
    getConfig().dummyRequestFilePath = hackDummyRequestFilePath;
  }
}

export function sendDummyRequest(): child_process$ChildProcess {
  return launchScriptForDummyConnection(getConfig().dummyRequestFilePath);
}

export function isDummyConnection(message: Object): boolean {
  const attributes = message.init.$;
  return attributes.fileuri.endsWith(getConfig().dummyRequestFilePath);
}

export function failConnection(socket: Socket, errorMessage: string): void {
  logger.log(errorMessage);
  socket.end();
  socket.destroy();
}

export function isCorrectConnection(message: Object): boolean {
  const {pid, idekeyRegex, scriptRegex} = getConfig();
  if (!message || !message.init || !message.init.$) {
    logger.logError('Incorrect init');
    return false;
  }

  const init = message.init;
  if (!init.engine || !init.engine || !init.engine[0] || init.engine[0]._ !== 'xdebug') {
    logger.logError('Incorrect engine');
    return false;
  }

  const attributes = init.$;
  if (attributes.xmlns !== 'urn:debugger_protocol_v1'
    || attributes['xmlns:xdebug'] !== 'http://xdebug.org/dbgp/xdebug'
    || attributes.language !== 'PHP') {
    logger.logError('Incorrect attributes');
    return false;
  }

  return (!pid || attributes.appid === String(pid)) &&
    (!idekeyRegex || new RegExp(idekeyRegex).test(attributes.idekey)) &&
    (!scriptRegex || new RegExp(scriptRegex).test(uriToPath(attributes.fileuri)));
}
