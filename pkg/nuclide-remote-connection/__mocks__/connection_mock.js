'use strict';

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _RemoteDirectory;

function _load_RemoteDirectory() {
  return _RemoteDirectory = require('../lib/RemoteDirectory');
}

var _RemoteFile;

function _load_RemoteFile() {
  return _RemoteFile = require('../lib/RemoteFile');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fsService = Object.assign({}, (_fsPromise || _load_fsPromise()).default, {
  async newFile(path) {
    return true;
  },
  async copy(src, dst) {
    await (_fsPromise || _load_fsPromise()).default.copy(src, dst);
    return true;
  },
  rmdir(uri) {
    return (_fsPromise || _load_fsPromise()).default.rimraf((_nuclideUri || _load_nuclideUri()).default.getPath(uri));
  },
  exists(uri) {
    return (_fsPromise || _load_fsPromise()).default.exists((_nuclideUri || _load_nuclideUri()).default.getPath(uri));
  },
  writeFileBuffer(path, buffer, options) {
    return (_fsPromise || _load_fsPromise()).default.writeFile(path, buffer, options);
  }
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */

const connectionMock = {
  getFsService: () => fsService,
  createDirectory: uri => new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory(connectionMock, uri),
  createFile: uri => new (_RemoteFile || _load_RemoteFile()).RemoteFile(connectionMock, uri),
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
};

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = connectionMock;