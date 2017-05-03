'use strict';

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

var _FileCache;

function _load_FileCache() {
  return _FileCache = require('../../nuclide-open-files-rpc/lib/FileCache');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This interface is exposed by the nuclide server process to the client side
// Atom process.
class RemoteCommandService {

  constructor() {
    this._disposables = new (_eventKit || _load_eventKit()).CompositeDisposable();
  }

  _registerAtomCommands(fileNotifier, atomCommands) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(fileNotifier instanceof (_FileCache || _load_FileCache()).FileCache)) {
        throw new Error('Invariant violation: "fileNotifier instanceof FileCache"');
      }

      const fileCache = fileNotifier;
      _this._disposables.add((yield (_CommandServer || _load_CommandServer()).CommandServer.register(fileCache, atomCommands)));
    })();
  }

  dispose() {
    this._disposables.dispose();
  }

  // Called by Atom once for each new remote connection.
  static registerAtomCommands(fileNotifier, atomCommands) {
    return (0, _asyncToGenerator.default)(function* () {
      const result = new RemoteCommandService();
      yield result._registerAtomCommands(fileNotifier, atomCommands);
      return result;
    })();
  }
}
exports.RemoteCommandService = RemoteCommandService; /**
                                                      * Copyright (c) 2015-present, Facebook, Inc.
                                                      * All rights reserved.
                                                      *
                                                      * This source code is licensed under the license found in the LICENSE file in
                                                      * the root directory of this source tree.
                                                      *
                                                      * 
                                                      * @format
                                                      */