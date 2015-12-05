/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


declare class ws$Server extends events$EventEmitter {
  constructor(options: {server: http$fixed$Server}): void;
  close(): void;
}

declare class ws$WebSocket extends events$EventEmitter {
  send(message: string, ack: (error: ?Object) => void): void;
  close(): void;
}

/**
 * {@https://github.com/websockets/ws}
 */
declare module 'ws' {
  declare class Server extends ws$Server {}
}
