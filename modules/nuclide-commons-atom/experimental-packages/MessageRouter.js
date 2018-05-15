'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _log4js;













function _load_log4js() {return _log4js = require('log4js');}var _collection;
function _load_collection() {return _collection = require('../../nuclide-commons/collection');}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _vscodeJsonrpc;
function _load_vscodeJsonrpc() {return _vscodeJsonrpc = _interopRequireWildcard(require('vscode-jsonrpc'));}var _messageReader;
function _load_messageReader() {return _messageReader = require('vscode-jsonrpc/lib/messageReader');}var _messageWriter;
function _load_messageWriter() {return _messageWriter = require('vscode-jsonrpc/lib/messageWriter');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}








/**
                                                                                                                                                                                                                                                                                                                                                                       * In the new package model, communication between packages will be modeled as sockets.
                                                                                                                                                                                                                                                                                                                                                                       * For each producer <-> consumer pair, we will create a socket:
                                                                                                                                                                                                                                                                                                                                                                       * the consumer gets one end of the socket, while the producer gets the other end.
                                                                                                                                                                                                                                                                                                                                                                       */ // We'll represent sockets in pairs (numbers and their negatives).
// After writing to a socket, the message may be read through its negative.
// eslint-disable-next-line
class MessageRouter {constructor() {this._curSocketID = 1;this._sockets = new Map();this.



    _buffer = new (_collection || _load_collection()).DefaultMap(Array);} // If messages are sent to a socket before a listener gets attached,
  // buffer it up here. The buffer will be cleared after the first getMessages call.
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
    const { socket } = message;
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
      subject = new _rxjsBundlesRxMinJs.Subject();
      this._sockets.set(socket, subject);
      const buffered = this._buffer.get(socket);
      this._buffer.delete(socket);
      return _rxjsBundlesRxMinJs.Observable.from(buffered).concat(subject);
    }
    return subject;
  }

  createConnection(socket, config) {
    const connection = (_vscodeJsonrpc || _load_vscodeJsonrpc()).createMessageConnection(
    // Messages intended for socket actually come through -socket.
    new SimpleReader(cb =>
    this.getMessages(this.reverseSocket(socket)).subscribe(cb)),

    // Tag each message with the socket it originated from.
    new SimpleWriter(msg => this.send(Object.assign({}, msg, { socket }))),
    (0, (_log4js || _load_log4js()).getLogger)('ExperimentalMessageRouter-jsonrpc'));

    connection.config = config || {};
    connection.listen();
    return connection;
  }}exports.default = MessageRouter; /**
                                      * Copyright (c) 2017-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the BSD-style license found in the
                                      * LICENSE file in the root directory of this source tree. An additional grant
                                      * of patent rights can be found in the PATENTS file in the same directory.
                                      *
                                      * 
                                      * @format
                                      */class SimpleReader extends (_messageReader || _load_messageReader()).AbstractMessageReader {constructor(subscribe) {super();this._subscribe = subscribe;}
  listen(callback) {
    this._subscribe(callback);
  }}


class SimpleWriter extends (_messageWriter || _load_messageWriter()).AbstractMessageWriter {


  constructor(write) {
    super();
    this._write = write;
  }

  write(message) {
    this._write(message);
  }}