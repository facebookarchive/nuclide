'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setMessageWriter = setMessageWriter;
exports.configure = configure;
exports.appender = appender;

var _protocol;

function _load_protocol() {
  return _protocol = require('../../../nuclide-vscode-language-service-rpc/lib/protocol');
}

var _messages;

function _load_messages() {
  return _messages = require('./messages');
}

let messageWriter = null;

// Required subset of LoggingEvent from log4js.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function setMessageWriter(writer) {
  messageWriter = writer;
}

function configure() {
  return appender();
}

function appender() {
  return loggingEvent => {
    const { level, data } = loggingEvent;
    // Skip if the message writer is unset or event is not an error.
    if (messageWriter == null || level.levelStr !== 'ERROR') {
      return;
    }
    messageWriter.write((0, (_messages || _load_messages()).windowMessage)((_protocol || _load_protocol()).MessageType.Error, data.map(val => JSON.stringify(val)).join('\n')));
  };
}