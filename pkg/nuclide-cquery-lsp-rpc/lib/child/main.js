/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import os from 'os';
import child_process from 'child_process';
import log4js from 'log4js';
import {memoryUsagePerPid} from 'nuclide-commons/process';
import {serializeAsyncCall} from 'nuclide-commons/promise';
import SafeStreamMessageReader from 'nuclide-commons/SafeStreamMessageReader';
import {Observable} from 'rxjs';
import {StreamMessageWriter} from 'vscode-jsonrpc';
import {createConnection} from 'vscode-languageserver';
import {track} from '../../../nuclide-analytics';
import {MessageHandler} from './MessageHandler';
import {initializeLogging} from './messages';

// Percentage of total memory cquery may not exceed.
const DEFAULT_MEMORY_LIMIT = 30;
// Time between checking cquery memory usage, in millseconds.
const MEMORY_CHECK_INTERVAL = 15000;

// Read and store arguments.
const loggingFile = process.argv[2];
const recordingFile = process.argv[3];
const libclangLogging = process.argv[4] === 'true';

// client reader/writer reads/writes to Nuclide.
const clientReader = new SafeStreamMessageReader(process.stdin);
const clientWriter = new StreamMessageWriter(process.stdout);
const clientConnection = createConnection(clientReader, clientWriter);
initializeLogging(clientConnection);

const logger = log4js.getLogger('nuclide-cquery-wrapper');

function onChildSpawn(childProcess): void {
  track('nuclide-cquery-lsp:child-started');
  // server reader/writer reads/writes to cquery.
  const serverReader = new SafeStreamMessageReader(childProcess.stdout);
  const serverWriter = new StreamMessageWriter(childProcess.stdin);
  // If child process quits, we also quit.
  childProcess.on('exit', code => process.exit(code));
  childProcess.on('close', code => process.exit(code));
  const messageHandler = new MessageHandler(serverWriter, clientWriter);

  clientReader.listen(message => {
    let handled = false;
    try {
      handled = messageHandler.handleFromClient(message);
    } catch (e) {
      const method = ((message: any): {method: string}).method;
      logger.error(`Uncaught error in ${method} override handler:`, e);
    }
    if (!handled) {
      serverWriter.write(message);
    }
  });

  serverReader.listen(message => {
    let handled = false;
    try {
      handled = messageHandler.handleFromServer(message);
    } catch (e) {
      const method = ((message: any): {method: string}).method;
      logger.error(`Uncaught error in ${method} override handler:`, e);
    }
    if (!handled) {
      clientWriter.write(message);
    }
  });

  // Every 15 seconds, check the server memory usage.
  // Note: totalmem() reports bytes, ps reports kilobytes.
  const memoryLimit = ((os.totalmem() / 1024) * DEFAULT_MEMORY_LIMIT) / 100;
  const serializedMemoryCheck = serializeAsyncCall(async () =>
    (await memoryUsagePerPid([childProcess.pid])).get(childProcess.pid),
  );
  Observable.interval(MEMORY_CHECK_INTERVAL).subscribe(async () => {
    const memoryUsed = await serializedMemoryCheck();
    if (memoryUsed != null && memoryUsed > memoryLimit) {
      track('nuclide-cquery-lsp:memory-used', {
        projects: messageHandler.knownProjects(),
        memoryUsed,
        memoryLimit,
      });
      logger.error(
        `Memory usage ${memoryUsed} exceeds limit ${memoryLimit}, killing cquery`,
      );
      childProcess.kill();
    }
  });
}

function spawnChild() {
  onChildSpawn(
    child_process.spawn(
      'cquery',
      ['--log-file', loggingFile, '--record', recordingFile],
      {
        env: libclangLogging
          ? {LIBCLANG_LOGGING: 1, ...process.env}
          : process.env,
        // only pipe stdin and stdout, and inherit stderr
        stdio: ['pipe', 'pipe', 'inherit'],
      },
    ),
  );
}

spawnChild();
