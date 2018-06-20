'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveConfiguration = resolveConfiguration;
exports.setSourcePathsService = setSourcePathsService;

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../nuclide-debugger-common');
}

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

let _sourcePathsService;

async function resolveConfiguration(configuration) {
  let sourcePath = configuration.config.sourcePath;

  const debuggerService = (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).getVSCodeDebuggerAdapterServiceByNuclideUri)(configuration.targetUri);

  if (sourcePath == null || sourcePath.trim() === '') {
    if (configuration.debugMode === 'launch') {
      sourcePath = await debuggerService.getBuckRootFromUri(configuration.config.program);
    } else {
      sourcePath = await debuggerService.getBuckRootFromPid(configuration.config.pid);
    }
  }

  const config = configuration.config;
  if (sourcePath != null && sourcePath.trim() !== '') {
    const canonicalSourcePath = await debuggerService.realpath(sourcePath);
    const sourcePaths = [];

    if (_sourcePathsService != null) {
      _sourcePathsService.addKnownNativeSubdirectoryPaths(canonicalSourcePath, sourcePaths);
    } else {
      sourcePaths.push(sourcePath);
    }

    config.sourcePaths = sourcePaths;
  }

  return Object.assign({}, configuration, {
    config
  });
}

function setSourcePathsService(service) {
  _sourcePathsService = service;
}