'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VsRawAdapterSpawnerService = undefined;
exports.createVsRawAdapterSpawnerService = createVsRawAdapterSpawnerService;
exports.getProcessTree = getProcessTree;
exports.getBuckRootFromUri = getBuckRootFromUri;
exports.getBuckRootFromPid = getBuckRootFromPid;
exports.realpath = realpath;
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

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../nuclide-commons/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../nuclide-commons/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

exports.VsRawAdapterSpawnerService = VsRawAdapterSpawnerService; /**
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

async function createVsRawAdapterSpawnerService() {
  return new VsRawAdapterSpawnerService();
}

async function getProcessTree() {
  return (0, (_process || _load_process()).psTree)();
}

async function getBuckRootFromUri(uri) {
  let path = uri;

  while (true) {
    const rootTest = (_nuclideUri || _load_nuclideUri()).default.join(path, '.buckconfig');
    // eslint-disable-next-line no-await-in-loop
    if (await (_fsPromise || _load_fsPromise()).default.exists(rootTest)) {
      return path;
    }
    const newPath = (_nuclideUri || _load_nuclideUri()).default.getParent(path);
    if (newPath === path) {
      break;
    }

    path = newPath;
  }

  return null;
}

async function getBuckRootFromPid(pid) {
  const path = await (0, (_process || _load_process()).getAbsoluteBinaryPathForPid)(pid);
  if (path == null) {
    return null;
  }

  return getBuckRootFromUri(path);
}

async function realpath(path) {
  return (_fsPromise || _load_fsPromise()).default.realpath(path);
}

async function getAdapterExecutableInfo(adapterType) {
  return (0, (_debuggerRegistry || _load_debuggerRegistry()).getAdapterExecutable)(adapterType);
}