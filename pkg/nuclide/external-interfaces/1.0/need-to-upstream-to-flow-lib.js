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
