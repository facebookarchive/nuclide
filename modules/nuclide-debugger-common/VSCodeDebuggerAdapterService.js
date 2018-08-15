"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createVsRawAdapterSpawnerService = createVsRawAdapterSpawnerService;
exports.getProcessTree = getProcessTree;
exports.getBuckRootFromUri = getBuckRootFromUri;
exports.getBuckRootFromPid = getBuckRootFromPid;
exports.realpath = realpath;
exports.getAdapterExecutableInfo = getAdapterExecutableInfo;
exports.VsRawAdapterSpawnerService = void 0;

function _process() {
  const data = require("../nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _VsAdapterSpawner() {
  const data = _interopRequireDefault(require("./VsAdapterSpawner"));

  _VsAdapterSpawner = function () {
    return data;
  };

  return data;
}

function _debuggerRegistry() {
  const data = require("./debugger-registry");

  _debuggerRegistry = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
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
class VsRawAdapterSpawnerService extends _VsAdapterSpawner().default {
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
  return (0, _process().psTree)();
}

async function getBuckRootFromUri(uri) {
  if (!_nuclideUri().default.isAbsolute(uri)) {
    return null;
  }

  let path = uri;

  while (true) {
    const rootTest = _nuclideUri().default.join(path, '.buckconfig'); // eslint-disable-next-line no-await-in-loop


    if (await _fsPromise().default.exists(rootTest)) {
      return path;
    }

    const newPath = _nuclideUri().default.getParent(path);

    if (newPath === path) {
      break;
    }

    path = newPath;
  }

  return null;
}

async function getBuckRootFromPid(pid) {
  const path = await (0, _process().getAbsoluteBinaryPathForPid)(pid);

  if (path == null) {
    return null;
  }

  return getBuckRootFromUri(path);
}

async function realpath(path) {
  return _fsPromise().default.realpath(path);
}

async function getAdapterExecutableInfo(adapterType) {
  return (0, _debuggerRegistry().getAdapterExecutable)(adapterType);
}