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

// Construct a LSP window/logMessage of given text and severity.
export function windowMessage(type: number, message: string): Message {
  return {
    jsonrpc: '2.0',
    method: 'window/logMessage',
    params: {
      message,
      type,
    },
  };
}

// Construct a LSP window/logMessage to add given compilation database.
export function addDbMessage(databaseDirectory: string): Message {
  return {
    jsonrpc: '2.0',
    method: '$cquery/addCompilationDb',
    params: {
      databaseDirectory,
    },
  };
}
