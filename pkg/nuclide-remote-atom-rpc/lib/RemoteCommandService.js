"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerAtomCommands = registerAtomCommands;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _FileCache() {
  const data = require("../../nuclide-open-files-rpc/lib/FileCache");

  _FileCache = function () {
    return data;
  };

  return data;
}

function _commandServerSingleton() {
  const data = require("./command-server-singleton");

  _commandServerSingleton = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/**
 * Called by Atom once for each new remote connection.
 */
async function registerAtomCommands(fileNotifier, atomCommands) {
  if (!(fileNotifier instanceof _FileCache().FileCache)) {
    throw new Error("Invariant violation: \"fileNotifier instanceof FileCache\"");
  }

  const fileCache = fileNotifier;
  const disposables = new (_UniversalDisposable().default)();
  disposables.add((await (0, _commandServerSingleton().getCommandServer)().register(fileCache, atomCommands)));
  return disposables;
}