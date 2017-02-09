/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

// https://github.com/Microsoft/vscode-languageserver-node/blob/master/jsonrpc/src/main.ts
export type JsonRpcConnection = {
  sendRequest(method: string, params?: Object): Promise<Object>,
  sendNotification(method: string, params?: Object): void,
  listen(): void,
  onNotification(type: {method: string}, callback: Object => void): void,
  dispose(): void,

  onError(callback: (Error, Object, number) => void): void,
  onClose(callback: () => void): void,
  onUnhandledNotification(callback: Object => void): void,
  onDispose(callback: () => void): void,
};
