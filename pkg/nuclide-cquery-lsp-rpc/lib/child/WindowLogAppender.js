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

import type {StreamMessageWriter} from 'vscode-jsonrpc';

import {MessageType} from '../../../nuclide-vscode-language-service-rpc/lib/protocol';
import {windowMessage} from './messages';

let messageWriter: ?StreamMessageWriter = null;

// Required subset of LoggingEvent from log4js.
type LoggingEvent = {level: {levelStr: string}, data: Array<mixed>};

export function setMessageWriter(writer: StreamMessageWriter) {
  messageWriter = writer;
}

export function configure() {
  return appender();
}

export function appender() {
  return (loggingEvent: LoggingEvent) => {
    const {level, data} = loggingEvent;
    // Skip if the message writer is unset or event is not an error.
    if (messageWriter == null || level.levelStr !== 'ERROR') {
      return;
    }
    messageWriter.write(
      windowMessage(
        MessageType.Error,
        data.map(val => JSON.stringify(val)).join('\n'),
      ),
    );
  };
}
