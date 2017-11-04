/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {
  RemoteConnection,
  RemoteDirectoryPlaceholder,
} from '../../nuclide-remote-connection';

/**
 * The prefix a URI must have for `RemoteDirectoryProvider` to try to produce a
 * `RemoteDirectory` for it. This should also be the path prefix checked by the
 * handler we register with `atom.project.registerOpener()` to open remote files.
 */
const REMOTE_PATH_URI_PREFIX = 'nuclide://';

export default class RemoteDirectoryProvider {
  directoryForURISync(uri: string): mixed {
    if (!uri.startsWith(REMOTE_PATH_URI_PREFIX)) {
      return null;
    }
    const connection = RemoteConnection.getForUri(uri);
    if (connection) {
      return connection.createDirectory(uri);
    } else {
      // Create a placeholder directory to temporarily satisfy Atom.
      // In Atom 1.22 onwards, Atom checks for the existence of all directories.
      // (If they don't exist, a big red error comes up).
      // We'll clean these up once the remote connection is actually established.
      return new RemoteDirectoryPlaceholder(uri);
    }
  }

  directoryForURI(uri: string): Promise<mixed> {
    return Promise.resolve(this.directoryForURISync(uri));
  }
}
