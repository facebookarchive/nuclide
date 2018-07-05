/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {ConnectionWrapper} from '../ConnectionWrapper';
import type {RemoteChildProcess} from '../RemoteProcess';
import type {LaunchAttributes} from './types';

import * as vscode from 'vscode';
import * as jsonrpc from 'vscode-jsonrpc';
import {getLogger} from 'log4js';
import {pathProcessor} from 'nuclide-debugger-common';
import {spawnRemote} from '../RemoteProcess';

const logger = getLogger('big-dig-debug-session');

/**
 * This manages a debug session via Big Dig. It is responsible for:
 * 1. Starting the debugger process on the remote machine.
 * 2. Using Big Dig to proxy the stdin/stdout from the debugger server running
 *    remotely to a local socket connection.
 * 3. Rewriting big-dig:// VS Code URIs as remote machine paths (and vice
 *    versa), as appropriate.
 */
export async function createBigDigDebugSession(
  connectionWrapper: ConnectionWrapper,
  hostname: string,
  launchAttributes: LaunchAttributes,
  inStream: stream$Readable,
  outStream: stream$Writable,
): Promise<BigDigDebugSession> {
  const {program, args, cwd} = launchAttributes;
  const proc = await spawnRemote(connectionWrapper, program, args, {cwd});
  initStreamProcessing(proc, inStream, outStream, hostname);
  return new BigDigDebugSession(proc);
}

function initStreamProcessing(
  proc: RemoteChildProcess,
  inStream: stream$Readable,
  outStream: stream$Writable,
  hostname: string,
): void {
  // For messages to the remote debugger, rewrite local big-dig:// URIs as paths
  // on the remote host.
  const localToRemoteMessageProcessor = pathProcessor(path => {
    const remote = vscode.Uri.parse(path).path;
    return remote;
  });
  const inStreamReader = new jsonrpc.StreamMessageReader(inStream);
  const inStreamWriter = new jsonrpc.StreamMessageWriter(proc.stdin);
  inStreamReader.listen(message => {
    logger.debug(
      'Message from inStreamReader:',
      JSON.stringify(message, null, 2),
    );
    localToRemoteMessageProcessor(message);
    inStreamWriter.write(message);
  });

  // For messages from the remote debugger, rewrite paths on the remote host
  // as local big-dig:// URIs.
  const uriPrefix = `big-dig://${hostname}`;
  const remoteToLocalMessageProcessor = pathProcessor(
    path => `${uriPrefix}${path}`,
  );
  const outStreamReader = new jsonrpc.StreamMessageReader(proc.stdout);
  const outStreamWriter = new jsonrpc.StreamMessageWriter(outStream);
  outStreamReader.listen(message => {
    logger.debug(
      'Message from outStreamReader:',
      JSON.stringify(message, null, 2),
    );
    remoteToLocalMessageProcessor(message);
    outStreamWriter.write(message);
  });
}

export class BigDigDebugSession {
  _proc: RemoteChildProcess;

  constructor(proc: RemoteChildProcess) {
    this._proc = proc;
  }

  dispose(): void {
    // Do any other resources need to be released?
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    this._proc.kill('KILL');
  }
}
