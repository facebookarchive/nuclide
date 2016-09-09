'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as OpenFilesService from '../../nuclide-open-files-rpc/lib/OpenFilesService';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {FileNotifier} from '../../nuclide-open-files-rpc/lib/rpc-types';

import {
  getServiceByConnection,
  ServerConnection,
  ConnectionCache,
} from '../../nuclide-remote-connection';
import {OPEN_FILES_SERVICE} from '../../nuclide-open-files-rpc';
import {getLogger} from '../../nuclide-logging';

const logger = getLogger();

const RESYNC_TIMEOUT_MS = 2000;

function getOpenFilesService(connection: ?ServerConnection): OpenFilesService {
  return getServiceByConnection(OPEN_FILES_SERVICE, connection);
}

// Keeps a FileNotifier around per ServerConnection.
//
// Also handles sending 'close' events to the FileNotifier so that
// the per-Buffer BufferSubscription does not need to live past
// the buffer being destroyed.
export class NotifiersByConnection {
  _notifiers: ConnectionCache<FileNotifier>;
  _getService: (connection: ?ServerConnection) => OpenFilesService;

  constructor(
    getService: (connection: ?ServerConnection) => OpenFilesService = getOpenFilesService,
  ) {
    this._getService = getService;
    this._notifiers = new ConnectionCache(connection => this._getService(connection).initialize());
  }

  dispose() {
    this._notifiers.dispose();
  }

  // Returns null for a buffer to a file on a closed remote connection
  // or a new buffer which has not been saved.
  get(buffer: atom$TextBuffer): ?Promise<FileNotifier> {
    return this.getForUri(buffer.getPath());
  }

  // Returns null for a buffer to a file on a closed remote connection
  // or a new buffer which has not been saved.
  getForUri(path: ?NuclideUri): ?Promise<FileNotifier> {
    return this._notifiers.getForUri(path);
  }

  // Sends the close message to the appropriate FileNotifier.
  // Will keep trying to send until the send succeeds or
  // the corresponding ServerConnection is closed.
  sendClose(filePath: NuclideUri, version: number): void {
    if (filePath === '') {
      return;
    }

    // Keep trying until either the close completes, or
    // the remote connection goes away
    const sendMessage = async () => {
      const notifier = this.getForUri(filePath);
      if (notifier != null) {
        try {
          const n = await notifier;
          const message = {
            kind: 'close',
            fileVersion: {
              notifier: n,
              filePath,
              version,
            },
          };

          await message.fileVersion.notifier.onEvent(message);
        } catch (e) {
          logger.error(`Error sending file close event: ${filePath} ${version}`, e);
          setTimeout(sendMessage, RESYNC_TIMEOUT_MS);
        }
      }
    };

    sendMessage();
  }
}
