'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteFileSystemServiceHandler = undefined;

var _filesystem_types;

function _load_filesystem_types() {
  return _filesystem_types = _interopRequireDefault(require('./gen-nodejs/filesystem_types'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../../nuclide-commons/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a service handler class to manage server methods
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

class RemoteFileSystemServiceHandler {
  // We need to initialize necessary server handler state later
  constructor() {}

  async createDirectory(uri) {
    try {
      return await (_fsPromise || _load_fsPromise()).default.mkdir(uri);
    } catch (err) {
      throw this._createThriftError(err);
    }
  }

  _createThriftError(err) {
    const error = new (_filesystem_types || _load_filesystem_types()).default.Error();
    error.code = err.code;
    error.message = (_filesystem_types || _load_filesystem_types()).default.ERROR_MAP[(_filesystem_types || _load_filesystem_types()).default.ErrorCode[err.code]];
    return error;
  }
}
exports.RemoteFileSystemServiceHandler = RemoteFileSystemServiceHandler;