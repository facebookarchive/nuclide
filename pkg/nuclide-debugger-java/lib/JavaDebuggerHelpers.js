'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.javaDebugAddBuckTargetSourcePaths = javaDebugAddBuckTargetSourcePaths;

var _utils;

function _load_utils() {
  return _utils = require('../../../modules/atom-ide-debugger-java/utils');
}

var _nuclideBuckRpc;

function _load_nuclideBuckRpc() {
  return _nuclideBuckRpc = _interopRequireWildcard(require('../../nuclide-buck-rpc'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Employs a heuristic to try and find the Java source path roots for a buck target.
async function javaDebugAddBuckTargetSourcePaths(processInfo, buckRoot, targetName) {
  const newSourceDirs = new Set();
  const sources = await (_nuclideBuckRpc || _load_nuclideBuckRpc()).query(buckRoot, `inputs(deps("${targetName}", 1))`, [] /* no extra arguments */
  );
  for (const sourcePath of sources) {
    const fullPath = (_nuclideUri || _load_nuclideUri()).default.join(buckRoot, sourcePath);
    const javaRootsToTry = ['java', 'com', 'net', 'org'];
    for (const javaRoot of javaRootsToTry) {
      const idx = fullPath.indexOf('/' + javaRoot + '/');
      if (idx > 0) {
        const dirname = fullPath.substring(0, idx);
        newSourceDirs.add(dirname);
        newSourceDirs.add((_nuclideUri || _load_nuclideUri()).default.join(dirname, javaRoot));
      }
    }
  }

  const newDirs = Array.from(newSourceDirs);
  if (newDirs.length > 0) {
    await javaDebugSetSourcePaths(processInfo, newDirs);
  }
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

async function javaDebugSetSourcePaths(processInfo, sourcePaths) {
  await processInfo.customRequest('setSourcePath', {
    sourcePath: (0, (_utils || _load_utils()).getSourcePathString)(sourcePaths)
  });
}