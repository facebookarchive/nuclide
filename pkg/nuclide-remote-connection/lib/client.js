

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _ServerConnection = require('./ServerConnection');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

module.exports = {
  getFileForPath: function getFileForPath(filePath) {
    if ((0, _nuclideRemoteUri.isRemote)(filePath)) {
      var connection = _ServerConnection.ServerConnection.getForUri(filePath);
      if (!connection) {
        return null;
      }
      return connection.createFile(filePath);
    } else {
      return new _atom.File(filePath);
    }
  }
};