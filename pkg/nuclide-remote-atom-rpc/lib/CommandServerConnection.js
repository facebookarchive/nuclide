"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommandServerConnection = void 0;

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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
class CommandServerConnection {
  constructor(fileCache, atomCommands) {
    this._atomCommands = atomCommands;
    this._fileCache = fileCache;
  }

  getAtomCommands() {
    return this._atomCommands;
  }

  hasOpenPath(filePath) {
    return !(0, _collection().iterableIsEmpty)((0, _collection().filterIterable)(this._fileCache.getOpenDirectories(), dir => _nuclideUri().default.contains(dir, filePath))) || (0, _collection().iterableContains)(this._fileCache.getOpenFiles(), filePath);
  }

}

exports.CommandServerConnection = CommandServerConnection;