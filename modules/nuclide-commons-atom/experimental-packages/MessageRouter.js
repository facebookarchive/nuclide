"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function jsonrpc() {
  const data = _interopRequireWildcard(require("vscode-jsonrpc"));

  jsonrpc = function () {
    return data;
  };

  return data;
}

function _messageReader() {
  const data = require("vscode-jsonrpc/lib/messageReader");

  _messageReader = function () {
    return data;
  };

  return data;
}

function _messageWriter() {
  const data = require("vscode-jsonrpc/lib/messageWriter");

  _messageWriter = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/**
 * In the new package model, communication between packages will be modeled as sockets.
 * For each producer <-> consumer pair, we will create a socket:
 * the consumer gets one end of the socket, while the producer gets the other end.
 */
class MessageRouter {
  constructor() {
    this._curSocketID = 1;
    this._sockets = new Map();
    this._buffer = new (_collection().DefaultMap)(Array);
  }

  /**
   * Returns a pair of sockets.
   */
  getSocket() {
    const socket = [this._curSocketID, -this._curSocketID];
    this._curSocketID++;
    return socket;
  }

  reverseSocket(socket) {
    return -socket;
  }

  send(message) {
    const {
      socket
    } = message;

    const subject = this._sockets.get(socket);

    if (subject == null) {
      this._buffer.get(socket).push(message);
    } else {
      subject.next(message);
    }
  }

  getMessages(socket) {
    let subject = this._sockets.get(socket);

    if (subject == null) {
      subject = new _RxMin.Subject();

      this._sockets.set(socket, subject);

      const buffered = this._buffer.get(socket);

      this._buffer.delete(socket);

      return _RxMin.Observable.from(buffered).concat(subject);
    }

    return subject;
  }

  createConnection(socket, config) {
    const connection = jsonrpc().createMessageConnection( // Messages intended for socket actually come through -socket.
    new SimpleReader(cb => this.getMessages(this.reverseSocket(socket)).subscribe(cb)), // Tag each message with the socket it originated from.
    new SimpleWriter(msg => this.send(Object.assign({}, msg, {
      socket
    }))), (0, _log4js().getLogger)('ExperimentalMessageRouter-jsonrpc'));
    connection.config = config || {};
    connection.listen();
    return connection;
  }

}

exports.default = MessageRouter;

class SimpleReader extends _messageReader().AbstractMessageReader {
  constructor(subscribe) {
    super();
    this._subscribe = subscribe;
  }

  listen(callback) {
    this._subscribe(callback);
  }

}

class SimpleWriter extends _messageWriter().AbstractMessageWriter {
  constructor(write) {
    super();
    this._write = write;
  }

  write(message) {
    this._write(message);
  }

}