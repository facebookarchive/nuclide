"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StreamTransport = void 0;

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _stream() {
  const data = require("../../../modules/nuclide-commons/stream");

  _stream = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class StreamTransport {
  constructor(output, input, messageLogger = (direction, message) => {
    return;
  }) {
    this._isClosed = false;
    this._messageLogger = messageLogger;
    this._output = output;
    this._messages = (0, _observable().splitStream)((0, _stream().observeStream)(input), false).do(message => {
      this._messageLogger('receive', message);
    });
  }

  send(message) {
    this._messageLogger('send', message);

    if (!(message.indexOf('\n') === -1)) {
      throw new Error('StreamTransport.send - unexpected newline in JSON message');
    }

    this._output.write(message + '\n');
  }

  onMessage() {
    return this._messages;
  }

  close() {
    this._isClosed = true;
  }

  isClosed() {
    return this._isClosed;
  }

}

exports.StreamTransport = StreamTransport;