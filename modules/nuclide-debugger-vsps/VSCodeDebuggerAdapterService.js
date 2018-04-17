'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAdapterExecutableInfo = exports.getProcessTree = exports.VsRawAdapterSpawnerService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getProcessTree = exports.getProcessTree = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    return (0, (_process || _load_process()).psTree)();
  });

  return function getProcessTree() {
    return _ref.apply(this, arguments);
  };
})();

let getAdapterExecutableInfo = exports.getAdapterExecutableInfo = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (adapterType) {
    return (0, (_main || _load_main()).getAdapterExecutable)(adapterType);
  });

  return function getAdapterExecutableInfo(_x) {
    return _ref2.apply(this, arguments);
  };
})();

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _main;

function _load_main() {
  return _main = require('./main');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class VsRawAdapterSpawnerService extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterSpawner {
  spawnAdapter(adapter) {
    return super.spawnAdapter(adapter);
  }

  write(input) {
    return super.write(input);
  }

  dispose() {
    return super.dispose();
  }
}

exports.VsRawAdapterSpawnerService = VsRawAdapterSpawnerService; /**
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