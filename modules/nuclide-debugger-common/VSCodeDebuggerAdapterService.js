'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VsRawAdapterSpawnerService = undefined;
exports.createVsRawAdapterSpawnerService = createVsRawAdapterSpawnerService;
exports.getProcessTree = getProcessTree;
exports.getAdapterExecutableInfo = getAdapterExecutableInfo;

var _process;

function _load_process() {
  return _process = require('../nuclide-commons/process');
}

var _VsAdapterSpawner;

function _load_VsAdapterSpawner() {
  return _VsAdapterSpawner = _interopRequireDefault(require('./VsAdapterSpawner'));
}

var _debuggerRegistry;

function _load_debuggerRegistry() {
  return _debuggerRegistry = require('./debugger-registry');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

class VsRawAdapterSpawnerService extends (_VsAdapterSpawner || _load_VsAdapterSpawner()).default {
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

exports.VsRawAdapterSpawnerService = VsRawAdapterSpawnerService;
async function createVsRawAdapterSpawnerService() {
  return new VsRawAdapterSpawnerService();
}

async function getProcessTree() {
  return (0, (_process || _load_process()).psTree)();
}

async function getAdapterExecutableInfo(adapterType) {
  return (0, (_debuggerRegistry || _load_debuggerRegistry()).getAdapterExecutable)(adapterType);
}