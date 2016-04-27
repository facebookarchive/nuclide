'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {EventEmitter} from 'events';
import {PromiseQueue} from '../../nuclide-commons';
import net from 'net';
import split from 'split';

/* eslint-disable no-console */

// TODO(mbolin): This redefinition of console.log() does not appear to be bulletproof.
// For example, if you do: `./bin/atom-script ./samples/keybindings.js | head`, you get
// an error.

/**
 * Logic to work around this issue: https://github.com/atom/atom/issues/10952.
 * Specifically, we want to ensure that `console.log()` writes "clean" output to stdout.
 * This means we need to wrap the appropriate functions so they do not include the extra
 * information added by Chromium's chatty logger.
 *
 * Unfortunately, this solution changes the semantics of console.log() to be asynchronous
 * rather than synchronous. Although it could return a Promise, it returns void to be consistent
 * with the original implementation of console.log().
 *
 * When console.log() (or .warn() or .error()) is called, it enqueues a request to atom-script via
 * the UNIX socket to print the specified message. The PromiseQueue that holds all of these
 * requests is returned by this function, along with a shutdown() function that should be used to
 * disconnect from the UNIX socket.
 */
export async function instrumentConsole(
  stdout: string,
): Promise<{queue: PromiseQueue; shutdown: () => void}> {
  const queue = new PromiseQueue();
  const connectedSocket = await queue.submit(resolve => {
    const socket = net.connect(
      {path: stdout},
      () => resolve(socket),
    );
  });

  const emitter = new EventEmitter();

  console.log = createFn(
    'log',
    connectedSocket,
    emitter,
    queue,
  );
  console.warn = createFn(
    'warn',
    connectedSocket,
    emitter,
    queue,
  );
  console.error = createFn(
    'error',
    connectedSocket,
    emitter,
    queue,
  );

  connectedSocket.pipe(split(/\0/)).on('data', function(id: string) {
    emitter.emit(id);
  });

  // Set up a mechanism to cleanly shut down the socket.
  function shutdown() {
    connectedSocket.end(JSON.stringify({method: 'end'}));
  }

  return {queue, shutdown};
}

/**
 * Each request is sent with a unique ID that the server should send back to signal that the
 * message has been written to the appropriate stream.
 */
let messageId = 0;

function createFn(
  method: string,
  connectedSocket: net$Socket,
  emitter: EventEmitter,
  queue: PromiseQueue,
) {
  return function(...args: string[]) {
    const id = (messageId++).toString(16);
    const message = args.join(' ') + '\n';
    const payload = {id, method, message};
    queue.submit(resolve => {
      // Set up the listener for the ack that the message was received.
      emitter.once(id, resolve);

      // Now that the listener is in place, send the message.
      connectedSocket.write(JSON.stringify(payload), 'utf8');
      connectedSocket.write('\n', 'utf8');
    });
  };
}
