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

import type {Message} from 'vscode-jsonrpc';

import child_process from 'child_process';
import {getLogger} from 'log4js';
import SafeStreamMessageReader from 'nuclide-commons/SafeStreamMessageReader';
import {StreamMessageWriter} from 'vscode-jsonrpc';

// Read and store arguments.
const loggingFile = process.argv[2];
const recordingFile = process.argv[3];
const libclangLogging = process.argv[4] === 'true';

const logger = getLogger('nuclide-cquery-wrapper');
let cqueryProcess: child_process$ChildProcess;

const handlers: {
  [key: string]: (Message, (Message) => mixed) => mixed,
} = {
  'textDocument/didOpen': async (message, callback) => {
    // TODO pelmers: buck query, buck build, cache values, then write an addDb message to cquery
    // then finally call back didOpen
    callback(message);
  },
};

function onChildSpawn(childProcess): void {
  const reader = new SafeStreamMessageReader(process.stdin);
  const writer = new StreamMessageWriter(childProcess.stdin);

  // If child process quits, we also quit.
  childProcess.on('exit', code => process.exit(code));
  childProcess.on('close', code => process.exit(code));

  reader.listen(message => {
    const callback = writer.write.bind(writer);
    // Message would have a method if it's a request or notification.
    const method: ?string = ((message: any): {method: ?string}).method;
    if (method != null && handlers[method] != null) {
      try {
        handlers[method](message, callback);
      } catch (e) {
        logger.error(`Error in ${method} override handler:`, e);
      }
    } else {
      callback(message);
    }
  });
}

function spawnChild() {
  cqueryProcess = child_process.spawn(
    'cquery',
    ['--log-file', loggingFile, '--record', recordingFile],
    {
      env: libclangLogging
        ? {LIBCLANG_LOGGING: 1, ...process.env}
        : process.env,
      // only pipe stdin, and inherit out/err
      stdio: ['pipe', process.stdout, process.stderr],
    },
  );
  onChildSpawn(cqueryProcess);
}

spawnChild();
