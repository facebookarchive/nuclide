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
import {track} from '../../../nuclide-analytics';
import {MessageHandler} from './MessageHandler';
import {setMessageWriter} from './WindowLogAppender';

// Percentage of total memory cquery may not exceed.
const DEFAULT_MEMORY_LIMIT = 30;
// Time between checking cquery memory usage, in millseconds.
const MEMORY_CHECK_INTERVAL = 15000;

// Read and store arguments.
const loggingFile = process.argv[2];
const recordingFile = process.argv[3];
const libclangLogging = process.argv[4] === 'true';

// Log to stderr to avoid polluting the JsonRpc stdout.
// Also send errors to the client's log.
log4js.configure({
  appenders: [
    {type: 'stderr'},
    {type: require.resolve('./WindowLogAppender'), level: 'error'},
  ],
});
const logger = log4js.getLogger('nuclide-cquery-wrapper');

function onChildSpawn(childProcess): void {
  // client reader/writer reads/writes to Nuclide.
  // server reader/writer reads/writes to cquery.
  const clientReader = new SafeStreamMessageReader(process.stdin);
  const serverWriter = new StreamMessageWriter(childProcess.stdin);
  const clientWriter = new StreamMessageWriter(process.stdout);
  setMessageWriter(clientWriter);

  // If child process quits, we also quit.
  childProcess.on('exit', code => process.exit(code));
  childProcess.on('close', code => process.exit(code));
  const clientMessageHandler = new MessageHandler(serverWriter, clientWriter);

  clientReader.listen(message => {
    // Message would have a method if it's a request or notification.
    const method: ?string = ((message: any): {method: ?string}).method;
    if (method != null && clientMessageHandler.canHandle(message)) {
      try {
        clientMessageHandler.handle(message);
      } catch (e) {
        logger.error(`Uncaught error in ${method} override handler:`, e);
      }
    } else {
      serverWriter.write(message);
    }
  });

  // Every 15 seconds, check the server memory usage.
  const memoryLimit = (os.totalmem() * DEFAULT_MEMORY_LIMIT) / 100;
  const serializedMemoryCheck = serializeAsyncCall(async () =>
    (await memoryUsagePerPid([childProcess.pid])).get(childProcess.pid),
  );
  Observable.interval(MEMORY_CHECK_INTERVAL).subscribe(async () => {
    const memoryUsed = await serializedMemoryCheck();
    if (memoryUsed != null) {
      track('nuclide-cquery-lsp:memory-used', {
        projects: clientMessageHandler.knownProjects(),
        memoryUsed,
        memoryLimit,
      });
      if (memoryUsed > memoryLimit) {
        logger.error(
          `Memory usage ${memoryUsed} exceeds limit ${memoryLimit}, killing cquery`,
        );
        childProcess.kill();
      }
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
        stdio: ['pipe', 'inherit', 'inherit'],
      },
    ),
  );
}

spawnChild();
