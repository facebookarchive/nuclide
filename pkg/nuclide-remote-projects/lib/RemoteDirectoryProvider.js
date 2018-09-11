"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

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

/**
 * The prefix a URI must have for `RemoteDirectoryProvider` to try to produce a
 * `RemoteDirectory` for it. This should also be the path prefix checked by the
 * handler we register with `atom.project.registerOpener()` to open remote files.
 */
const REMOTE_PATH_URI_PREFIX = 'nuclide://';

class RemoteDirectoryProvider {
  directoryForURISync(uri) {
    if (!uri.startsWith(REMOTE_PATH_URI_PREFIX)) {
      return null;
    }

    const connection = _nuclideRemoteConnection().RemoteConnection.getForUri(uri);

    if (connection) {
      return connection.createDirectory(uri);
    } else {
      // Return a placeholder that always return true for existsSync.
      // This is to prevent Atom from displaying an error at startup.
      // We remove all remote projects in Nuclide's main.js file, and then
      // later reload them manually in the remote-projects main file.
      return new (_nuclideRemoteConnection().RemoteDirectoryPlaceholder)(uri);
    }
  }

  directoryForURI(uri) {
    return Promise.resolve(this.directoryForURISync(uri));
  }

}

exports.default = RemoteDirectoryProvider;