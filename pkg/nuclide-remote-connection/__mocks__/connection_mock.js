"use strict";

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _RemoteDirectory() {
  const data = require("../lib/RemoteDirectory");

  _RemoteDirectory = function () {
    return data;
  };

  return data;
}

function _RemoteFile() {
  const data = require("../lib/RemoteFile");

  _RemoteFile = function () {
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
 * 
 * @format
 */
const fsService = Object.assign({}, _fsPromise().default, {
  async newFile(path) {
    return true;
  },

  async copy(src, dst) {
    await _fsPromise().default.copy(src, dst);
    return true;
  },

  rmdir(uri) {
    return _fsPromise().default.rimraf(_nuclideUri().default.getPath(uri));
  },

  exists(uri) {
    return _fsPromise().default.exists(_nuclideUri().default.getPath(uri));
  },

  writeFileBuffer(path, buffer, options) {
    return _fsPromise().default.writeFile(path, buffer, options);
  }

});
const connectionMock = {
  getFsService: () => fsService,
  createDirectory: uri => new (_RemoteDirectory().RemoteDirectory)(connectionMock, uri),
  createFile: uri => new (_RemoteFile().RemoteFile)(connectionMock, uri),
  getRemoteConnectionForUri: () => null,
  getService: serviceName => {
    if (serviceName === 'FileSystemService') {
      return fsService;
    } else {
      throw new Error(`TODO: missing mock ${serviceName}`);
    }
  },
  getFileWatch: () => {
    throw new Error('mock me');
  },
  getDirectoryWatch: () => {
    throw new Error('mock me');
  }
}; // eslint-disable-next-line nuclide-internal/no-commonjs

module.exports = connectionMock;