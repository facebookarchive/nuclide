'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

/**
 * The prefix a URI must have for `RemoteDirectoryProvider` to try to produce a
 * `RemoteDirectory` for it. This should also be the path prefix checked by the
 * handler we register with `atom.project.registerOpener()` to open remote files.
 */
const REMOTE_PATH_URI_PREFIX = 'nuclide://'; /**
                                              * Copyright (c) 2015-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the license found in the LICENSE file in
                                              * the root directory of this source tree.
                                              *
                                              * 
                                              * @format
                                              */

class RemoteDirectoryProvider {
  directoryForURISync(uri) {
    if (!uri.startsWith(REMOTE_PATH_URI_PREFIX)) {
      return null;
    }
    const connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getForUri(uri);
    if (connection) {
      return connection.createDirectory(uri);
    } else {
      // Return null here. In response, Atom will create a generic Directory for
      // this URI, and add it to the list of root project paths (atom.project.getPaths()).
      // In remote-projects/main.js, we remove these generic directories.
      return null;
    }
  }

  directoryForURI(uri) {
    return Promise.resolve(this.directoryForURISync(uri));
  }
}
exports.default = RemoteDirectoryProvider;