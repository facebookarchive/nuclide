

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _ServerConnection2;

function _ServerConnection() {
  return _ServerConnection2 = require('./ServerConnection');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

module.exports = {
  getFileForPath: function getFileForPath(filePath) {
    if ((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRemote(filePath)) {
      var connection = (_ServerConnection2 || _ServerConnection()).ServerConnection.getForUri(filePath);
      if (!connection) {
        return null;
      }
      return connection.createFile(filePath);
    } else {
      return new (_atom2 || _atom()).File(filePath);
    }
  }
};