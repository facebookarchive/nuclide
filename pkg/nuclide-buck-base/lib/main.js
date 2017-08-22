'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBuckProjectRoot = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Cached, service-aware version of BuckProject.getRootForPath.
 */
let getBuckProjectRoot = exports.getBuckProjectRoot = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (filePath) {
    let directory = buckProjectDirectoryByPath.get(filePath);
    // flowlint-next-line sketchy-null-string:off
    if (!directory) {
      const service = getBuckService(filePath);
      if (service == null) {
        return null;
      }
      directory = yield service.getRootForPath(filePath);
      if (directory == null) {
        return null;
      } else {
        buckProjectDirectoryByPath.set(filePath, directory);
      }
    }
    return directory;
  });

  return function getBuckProjectRoot(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.isBuckFile = isBuckFile;
exports.getBuckService = getBuckService;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const buckProjectDirectoryByPath = new Map(); /**
                                               * Copyright (c) 2015-present, Facebook, Inc.
                                               * All rights reserved.
                                               *
                                               * This source code is licensed under the license found in the LICENSE file in
                                               * the root directory of this source tree.
                                               *
                                               * 
                                               * @format
                                               */

function isBuckFile(filePath) {
  // TODO(mbolin): Buck does have an option where the user can customize the
  // name of the build file: https://github.com/facebook/buck/issues/238.
  // This function will not work for those who use that option.
  return (_nuclideUri || _load_nuclideUri()).default.basename(filePath) === 'BUCK';
}

function getBuckService(filePath) {
  return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('BuckService', filePath);
}