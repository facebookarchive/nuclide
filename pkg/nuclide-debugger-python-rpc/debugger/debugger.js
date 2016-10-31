'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebuggerEvent, Message} from './types';

import {Observable} from 'rxjs';
import child_process from 'child_process';
import net from 'net';
import pathUtil from '../../commons-node/nuclideUri';
import split from 'split';
import uuid from 'uuid';

const METHOD_CONNECT = 'connect';
const METHOD_EXIT = 'exit';
const METHOD_INIT = 'init';
const METHOD_START = 'start';
const METHOD_STOP = 'stop';

const PARAM_BREAKPOINTS = 'breakpoints';
const PARAM_METHOD = 'method';

export function launchDebugger(
  commander: Observable<Message>,
  initialBreakpoints: Array<Object>,
  pathToPythonExecutable: string,
  pythonArgs: Array<string>,
): Observable<DebuggerEvent> {
  return Observable.create((observer: rxjs$Observer<DebuggerEvent>) => {
    function log(message: string) {
      observer.next({event: 'log', message});
    }

    const server = net.createServer((connection: net$Socket) => {
      // For simplicity, we use newline-delimited-JSON as our wire protocol.
      function write(dict: mixed) {
        connection.write(JSON.stringify(dict) + '\n');
      }

      // Listen to events broadcast from the Python debugger.
      connection
        .pipe(split(JSON.parse, /* mapper */ null, {trailing: false}))
        .on('data', (args: Object) => {
          const method = args[PARAM_METHOD];
          if (method === METHOD_CONNECT) {
            // On initial connection, we should send the breakpoints over.
            write({[PARAM_METHOD]: METHOD_INIT, [PARAM_BREAKPOINTS]: initialBreakpoints});
            observer.next({event: 'connected'});
          } else if (method === METHOD_STOP) {
            const {file, line} = args;
            observer.next({event: 'stop', file, line});
          } else if (method === METHOD_EXIT) {
            observer.next({event: 'exit'});
            connection.end();
          } else if (method === METHOD_START) {
            observer.next({event: 'start'});
          } else {
            const error = new Error(`Unrecognized message: ${JSON.stringify(args)}`);
            observer.error(error);
          }
        });

      // Take requests from the input commander and pass them through to the Python debugger.
      // TODO(mbolin): If a `quit` message comes in, we should tear down everything from here
      // because the Python code may be locked up such that it won't get the message.
      commander.subscribe(
        write,
        (error: Error) => log(`Unexpected error from commander: ${String(error)}`),
        () => log('Apparently the commander is done.'),
      );

      connection.on('end', () => {
        // In the current design, we only expect there to be one connection ever, so when it
        // disconnects, we can shut down the server.
        server.close();
        observer.complete();
      });
    });

    server.on('error', err => {
      observer.error(err);
      throw err;
    });

    const socketPath = createSocketPath();
    server.listen({path: socketPath}, () => {
      log(`listening for connections on ${socketPath}. About to run python.`);

      // The connection is set up, so now we can launch our Python program.
      const pythonDebugger = pathUtil.join(__dirname, 'main.py');
      const args = [pythonDebugger, socketPath].concat(pythonArgs);
      const python = child_process.spawn(pathToPythonExecutable, args);

      /* eslint-disable no-console */
      // TODO(mbolin): These do not seem to be fired until the debugger finishes.
      // Probably need to handle things differently in debugger.py.
      python.stdout.on('data', data => console.log(`python stdout: ${data}`));
      python.stderr.on('data', data => console.log(`python stderr: ${data}`));
      /* eslint-enable no-console */
    });
  });
}

function createSocketPath(): string {
  return pathUtil.join(require('os').tmpdir(), `${uuid.v4()}.sock`);
}
