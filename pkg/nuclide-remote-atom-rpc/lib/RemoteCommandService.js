'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteCommandService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _CommandServer;

function _load_CommandServer() {
  return _CommandServer = require('./CommandServer');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This interface is exposed by the nuclide server process to the client side
// Atom process.
let RemoteCommandService = exports.RemoteCommandService = class RemoteCommandService {

  constructor(port) {
    this._port = port;
    this._disposables = new (_eventKit || _load_eventKit()).CompositeDisposable();
  }

  _registerAtomCommands(atomCommands) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._disposables.add((yield (_CommandServer || _load_CommandServer()).CommandServer.create(_this._port, atomCommands)));
    })();
  }

  dispose() {
    this._disposables.dispose();
  }

  // Called by Atom once for each new remote connection.
  static registerAtomCommands(port, atomCommands) {
    return (0, _asyncToGenerator.default)(function* () {
      const result = new RemoteCommandService(port);
      yield result._registerAtomCommands(atomCommands);
      return result;
    })();
  }
};