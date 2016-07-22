/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/* eslint-disable no-unused-vars */

/**
 * https://github.com/websockets/ws/blob/master/doc/ws.md
 */

declare module 'ws' {
  declare class ws$Server extends events$EventEmitter {
    // TODO properly type the options object
    constructor(options: Object): void,
    close(): void,
  }

  declare class ws$WebSocket extends events$EventEmitter {
    static Server: typeof ws$Server,

    onopen?: () => mixed,
    onclose?: () => mixed,
    onerror?: () => mixed,

    send(message: string | Buffer, ack?: (error: ?Object) => void): void,
    send(message: string | Buffer, options: Object, ack: (error: ?Object) => void): void,
    close(): void,
    terminate(): void,
    ping(
      data: ?string,
      options?: {mask?: boolean, binary?: boolean},
      dontFailWhenClosed?: boolean,
    ): void,
  }

  declare var exports: typeof ws$WebSocket;
}
