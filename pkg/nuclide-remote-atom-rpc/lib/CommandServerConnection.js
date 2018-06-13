'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommandServerConnection = undefined;

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CommandServerConnection {

  constructor(fileCache, atomCommands) {
    this._atomCommands = atomCommands;
    this._fileCache = fileCache;
  }

  getAtomCommands() {
    return this._atomCommands;
  }

  hasOpenPath(filePath) {
    return !(0, (_collection || _load_collection()).iterableIsEmpty)((0, (_collection || _load_collection()).filterIterable)(this._fileCache.getOpenDirectories(), dir => (_nuclideUri || _load_nuclideUri()).default.contains(dir, filePath))) || (0, (_collection || _load_collection()).iterableContains)(this._fileCache.getOpenFiles(), filePath);
  }
}
exports.CommandServerConnection = CommandServerConnection; /**
                                                            * Copyright (c) 2015-present, Facebook, Inc.
                                                            * All rights reserved.
                                                            *
                                                            * This source code is licensed under the license found in the LICENSE file in
                                                            * the root directory of this source tree.
                                                            *
                                                            * 
                                                            * @format
                                                            */