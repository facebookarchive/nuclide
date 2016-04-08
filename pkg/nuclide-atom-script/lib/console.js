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
import net from 'net';

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
 * @return a "notify when stdout is flushed" function that returns a Promise that will be resolved
 *   when all messages have been written to the UNIX domain socket.
 */
export async function instrumentConsole(stdout: string): Promise<() => Promise<void>> {
  const connectedSocket = await new Promise(resolve => {
    const socket = net.connect(
      {path: stdout},
      // $FlowIgnore: Not sure what's up with this.
      () => resolve(socket),
    );
  });

  const emitter = new EventEmitter();
  const QUEUE_CLEARED_EVENT_NAME = 'queue-cleared';

  function isQueueCleared(): boolean {
    // Until we can figure out a better way to do this, we have to rely on an internal Node API.
    return !connectedSocket._writableState.needDrain;
  }

  function dispatchWhenClear() {
    if (isQueueCleared()) {
      emitter.emit(QUEUE_CLEARED_EVENT_NAME);
    } else {
      setTimeout(dispatchWhenClear, 10);
    }
  }

  console.log = (...args: string[]) => {
    const message = args.join(' ');
    connectedSocket.write(message + '\n');
    dispatchWhenClear();
  };

  return () => {
    if (isQueueCleared()) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      emitter.once(QUEUE_CLEARED_EVENT_NAME, resolve);
    });
  };
}
