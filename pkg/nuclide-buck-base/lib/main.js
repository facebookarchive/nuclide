"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isBuckFile = isBuckFile;
exports.getBuckService = getBuckService;
exports.getBuckProjectRoot = getBuckProjectRoot;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
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
 *  strict-local
 * @format
 */
const buckProjectDirectoryByPath = new Map();

function isBuckFile(filePath) {
  // TODO(mbolin): Buck does have an option where the user can customize the
  // name of the build file: https://github.com/facebook/buck/issues/238.
  // This function will not work for those who use that option.
  return _nuclideUri().default.basename(filePath) === 'BUCK';
}

function getBuckService(filePath) {
  return (0, _nuclideRemoteConnection().getServiceByNuclideUri)('BuckService', filePath);
}
/**
 * Cached, service-aware version of BuckProject.getRootForPath.
 */


async function getBuckProjectRoot(filePath) {
  let directory = buckProjectDirectoryByPath.get(filePath); // flowlint-next-line sketchy-null-string:off

  if (!directory) {
    const service = getBuckService(filePath);

    if (service == null) {
      return null;
    }

    directory = await service.getRootForPath(filePath);

    if (directory == null) {
      return null;
    } else {
      buckProjectDirectoryByPath.set(filePath, directory);
    }
  }

  return directory;
}