

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _require = require('./ServerConnection');

var ServerConnection = _require.ServerConnection;

var _require2 = require('../../nuclide-remote-uri');

var isRemote = _require2.isRemote;

module.exports = {
  getFileForPath: function getFileForPath(filePath) {
    if (isRemote(filePath)) {
      var connection = ServerConnection.getForUri(filePath);
      if (!connection) {
        return null;
      }
      return connection.createFile(filePath);
    } else {
      return new _atom.File(filePath);
    }
  }
};