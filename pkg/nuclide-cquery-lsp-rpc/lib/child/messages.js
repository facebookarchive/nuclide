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
import type {ShowStatusParams} from '../../../nuclide-vscode-language-service-rpc/lib/protocol';

import log4js from 'log4js';
import {IConnection} from 'vscode-languageserver';
import {setupLoggingService} from '../../../nuclide-logging';

import uuid from 'uuid';

export type CqueryProgressNotification = {
  indexRequestCount: number,
  doIdMapCount: number,
  loadPreviousIndexCount: number,
  onIdMappedCount: number,
  onIndexedCount: number,
};

// Generate an instanceid to avoid collisions after restart.
const instanceId = uuid.v4();
let nextRequestId = 0;
function generateId(): string {
  // Pick a prefix that will not collide with cquery.
  return `nuclide-cquery-${instanceId}-${nextRequestId++}`;
}

export function initializeLogging(connection: IConnection) {
  setupLoggingService();
  // Log to stderr to avoid polluting the JsonRpc stdout.
  // Also send errors to the client's log.
  log4js.configure({
    appenders: [
      {type: 'stderr'},
      {
        type: 'logLevelFilter',
        level: 'WARN',
        appender: {
          connection,
          type: require.resolve(
            '../../../nuclide-lsp-implementation-common/connectionConsoleAppender',
          ),
        },
      },
    ],
  });
}

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

export function windowStatusMessage(params: ShowStatusParams): Message {
  return {
    jsonrpc: '2.0',
    method: 'window/showStatus',
    id: generateId(),
    params,
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
