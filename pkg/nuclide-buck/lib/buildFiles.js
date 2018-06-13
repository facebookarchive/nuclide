'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openNearestBuildFile = openNearestBuildFile;
exports.findNearestBuildFile = findNearestBuildFile;
exports.getBuildFileName = getBuildFileName;
exports.getCellLocation = getCellLocation;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _nuclideBuckBase;

function _load_nuclideBuckBase() {
  return _nuclideBuckBase = require('../../nuclide-buck-base');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _getElementFilePath;

function _load_getElementFilePath() {
  return _getElementFilePath = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/getElementFilePath'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../modules/nuclide-commons-atom/go-to-location');
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

const DEFAULT_BUILD_FILE_NAME = 'BUCK';

async function openNearestBuildFile(target) {
  const path = (0, (_getElementFilePath || _load_getElementFilePath()).default)(target, true);
  if (path != null) {
    const buildFile = await findNearestBuildFile(path);
    if (buildFile != null) {
      // For bonus points, someone could add some logic to find the appropriate line:col to focus
      // upon opening the file and pass that to goToLocation().
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(buildFile);
    }
  }
}

async function findNearestBuildFile(textEditorPath) {
  const buckRoot = await (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckProjectRoot)(textEditorPath);
  if (buckRoot != null) {
    const buildFileName = await getBuildFileName(buckRoot);
    const fsService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(textEditorPath);
    return fsService.findNearestAncestorNamed(buildFileName, (_nuclideUri || _load_nuclideUri()).default.dirname(textEditorPath));
  }
  return null;
}

const buildFileNameCache = new Map();
function getBuildFileName(buckRoot) {
  let buildFileName = buildFileNameCache.get(buckRoot);
  if (buildFileName != null) {
    return buildFileName;
  }
  const buckService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(buckRoot);
  buildFileName = buckService.getBuckConfig(buckRoot, 'buildfile', 'name').catch(error => {
    (0, (_log4js || _load_log4js()).getLogger)('nuclide-buck').error(`Error trying to find the name of the buildfile in Buck project '${buckRoot}'`, error);
    return null;
  })
  // flowlint-next-line sketchy-null-string:off
  .then(result => result || DEFAULT_BUILD_FILE_NAME);
  buildFileNameCache.set(buckRoot, buildFileName);
  return buildFileName;
}

const cellLocationCache = new Map();
/**
 * @return path of the provided cell from .buckconfig.
 */
function getCellLocation(buckRoot, cellName) {
  const cacheKey = buckRoot + '->' + cellName;
  const cachedLocation = cellLocationCache.get(cacheKey);
  if (cachedLocation != null) {
    return cachedLocation;
  }
  const buckService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(buckRoot);
  const cellLocation = buckService.getBuckConfig(buckRoot, 'repositories', cellName).catch(error => {
    (0, (_log4js || _load_log4js()).getLogger)('nuclide-buck').error(`Error trying to find the location of '${cellName}' for Buck project '${buckRoot}'`, error);
    return '';
  }).then(result => result == null ? '' : result);
  cellLocationCache.set(cacheKey, cellLocation);
  return cellLocation;
}