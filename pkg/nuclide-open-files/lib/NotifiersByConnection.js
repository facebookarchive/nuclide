'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileNotifier} from '../../nuclide-open-files-rpc/lib/OpenFilesService';
import typeof * as OpenFilesService from '../../nuclide-open-files-rpc/lib/OpenFilesService';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import invariant from 'assert';
import {getlocalService, ServerConnection} from '../../nuclide-remote-connection';
import {OPEN_FILES_SERVICE} from '../../nuclide-open-files-rpc';
import {getLogger} from '../../nuclide-logging';
import nuclideUri from '../../commons-node/nuclideUri';

const logger = getLogger();

const RESYNC_TIMEOUT_MS = 2000;

function getServiceByConnection(connection: ?ServerConnection): OpenFilesService {
  let service: ?OpenFilesService;
  if (connection == null) {
    service = getlocalService(OPEN_FILES_SERVICE);
  } else {
    service = connection.getService(OPEN_FILES_SERVICE);
  }
  invariant(service != null);
  return service;
}

// Keeps a FileNotifier around per ServerConnection.
//
// Also handles sending 'close' events to the FileNotifier so that
// the per-Buffer BufferSubscription does not need to live past
// the buffer being destroyed.
export class NotifiersByConnection {
  _notifiers: Map<?ServerConnection, Promise<FileNotifier>>;
  _subscription: IDisposable;
  _getService: (connection: ?ServerConnection) => OpenFilesService;

  constructor(
    getService: (connection: ?ServerConnection) => OpenFilesService = getServiceByConnection,
  ) {
    this._getService = getService;
    this._notifiers = new Map();

    this._subscription = ServerConnection.onDidCloseServerConnection(connection => {
      this._notifiers.delete(connection);
    });

    this._addConnection(null);
    ServerConnection.observeConnections(connection => {
      this._addConnection(connection);
    });
  }

  dispose() {
    this._subscription.dispose();
  }

  // Returns null for a buffer to a file on a closed remote connection
  // or a new buffer which has not been saved.
  get(buffer: atom$TextBuffer): ?Promise<FileNotifier> {
    return this.getForPath(buffer.getPath());
  }

  // Returns null for a buffer to a file on a closed remote connection
  // or a new buffer which has not been saved.
  getForPath(path: ?NuclideUri): ?Promise<FileNotifier> {
    if (path == null) {
      return null;
    }

    // Note that there is a window after a ServerConnection is closed when
    // TextBuffers on that connection are still around receiving events.
    const connection = ServerConnection.getForUri(path);
    if (connection == null && nuclideUri.isRemote(path)) {
      return null;
    }

    return this._notifiers.get(connection);
  }

  _addConnection(connection: ?ServerConnection) {
    invariant(!this._notifiers.has(connection));
    const service: ?OpenFilesService = this._getService(connection);
    invariant(service != null);
    this._notifiers.set(connection, service.initialize());
  }

  // Sends the close message to the appropriate FileNotifier.
  // Will keep trying to send until the send succeeds or
  // the corresponding ServerConnection is closed.
  sendClose(filePath: NuclideUri, version: number): void {
    invariant(filePath !== '');

    const message = {
      kind: 'close',
      fileVersion: {
        filePath,
        version,
      },
    };

    // Keep trying until either the close completes, or
    // the remote connection goes away
    const sendMessage = async () => {
      const notifier = this.getForPath(filePath);
      if (notifier != null) {
        try {
          await (await notifier).onEvent(message);
        } catch (e) {
          logger.error(`Error sending file close event: ${JSON.stringify(message)}`, e);
          setTimeout(sendMessage, RESYNC_TIMEOUT_MS);
        }
      }
    };

    sendMessage();
  }
}
