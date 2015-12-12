/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*
 * APIs listed in this file are ones that should be built into Flow and need to be upstreamed.
 */

/* eslint-disable no-unused-vars */

declare class Worker {
  addEventListener(type: 'message', listener: (message: {data: mixed}) => mixed): void;
  addEventListener(type: 'error', listener: (error: Error) => mixed): void;
  terminate(): void;
  postMessage(message: mixed): void;
}

type IDBDatabase = {
  close: () => void;
  transaction: (key: string) => any;
}

type CreateInterfaceOptions = {
  input: stream$Readable;
  output?: stream$Writable;
  completer?: (line: string) => [Array<string>, string];
  terminal?: boolean;
  historySize?: number;
}

declare module 'readline' {
  declare class Interface {
    on: (event: string, listener: Function) => void;
    close: () => void;
  }
  declare function createInterface(options: CreateInterfaceOptions): Interface;
}

// T9254051 - Fix flow http/https definitions.
declare class http$fixed$Server extends events$EventEmitter {
  listen(port: number, hostname?: string, backlog?: number, callback?: Function): http$fixed$Server;
  listen(path: string, callback?: Function): http$fixed$Server;
  listen(handle: Object, callback?: Function): http$fixed$Server;
  close(callback?: Function): http$fixed$Server;
  address(): { port: number; fmaily: string; address: string; };
  maxHeadersCount: number;
}

declare class http$fixed$IncomingMessage extends stream$Readable {
  headers: Object;
  httpVersion: string;
  method: string;
  trailers: Object;
  setTimeout(msecs: number, callback: Function): void;
  socket: any;  // TODO net.Socket
  statusCode: number;
  url: String;
  connection: { destroy: () =>void };
}

declare class http$fixed$ClientRequest extends stream$Writable {
}

declare class http$fixed$ServerResponse {
  setHeader(name: string, value: string): void;
  statusCode: number;
  write(value: string): void;
  end(): void;
}

declare class https$fixed {
  Server: typeof http$fixed$Server;
  createServer(options: Object,
    requestListener?:
      (request: http$fixed$IncomingMessage, response: http$fixed$ServerResponse) => void):
      http$fixed$Server;
  request(
    options: Object | string,
    callback: (response: http$fixed$IncomingMessage) => void
  ): http$fixed$ClientRequest;
  get(
    options: Object | string,
    callback: (response: http$fixed$IncomingMessage) => void
  ): http$fixed$ClientRequest;
}

declare class http$fixed {
  Server: typeof http$fixed$Server;
  createServer(requestListener?:
      (request: http$fixed$IncomingMessage, response: http$fixed$ServerResponse) => void):
      http$fixed$Server;
  request(
    options: Object | string,
    callback: (response: http$fixed$IncomingMessage) => void
  ): http$fixed$ClientRequest;
  get(
    options: Object | string,
    callback: (response: http$fixed$IncomingMessage) => void
  ): http$fixed$ClientRequest;
}
