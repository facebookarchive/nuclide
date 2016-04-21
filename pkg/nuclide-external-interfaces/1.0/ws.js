/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable no-unused-vars */

declare class ws$Server extends events$EventEmitter {
  // TODO properly type the options object
  constructor(options: Object): void;
  close(): void;
}

declare class ws$WebSocket extends events$EventEmitter {
  static Server: Class<ws$Server>;

  // Largely derived from https://github.com/websockets/ws/blob/master/doc/ws.md

  onopen?: () => mixed;
  onclose?: () => mixed;
  onerror?: () => mixed;

  send(message: string, ack?: (error: ?Object) => void): void;
  close(): void;
  terminate(): void;
}

/**
 * {@https://github.com/websockets/ws}
 */
declare module 'ws' {
  declare var exports: Class<ws$WebSocket>;
}
