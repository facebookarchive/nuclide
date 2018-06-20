'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerAtomCommands = registerAtomCommands;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _FileCache;

function _load_FileCache() {
  return _FileCache = require('../../nuclide-open-files-rpc/lib/FileCache');
}

var _commandServerSingleton;

function _load_commandServerSingleton() {
  return _commandServerSingleton = require('./command-server-singleton');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Called by Atom once for each new remote connection.
 */


// This interface is exposed by the nuclide server process to the client side
// Atom process.

/** Dummy alias for IDisposable to satisfy Nuclide-RPC. */
async function registerAtomCommands(fileNotifier, atomCommands) {
  if (!(fileNotifier instanceof (_FileCache || _load_FileCache()).FileCache)) {
    throw new Error('Invariant violation: "fileNotifier instanceof FileCache"');
  }

  const fileCache = fileNotifier;

  const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  disposables.add((await (0, (_commandServerSingleton || _load_commandServerSingleton()).getCommandServer)().register(fileCache, atomCommands)));
  return disposables;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */