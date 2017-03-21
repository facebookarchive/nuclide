/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../commons-node/nuclideUri';

import {TextBuffer} from 'atom';
import {Observable} from 'rxjs';
import invariant from 'assert';

import nuclideUri from '../commons-node/nuclideUri';
import {observableFromSubscribeFunction} from '../commons-node/event';
import {ServerConnection, NuclideTextBuffer} from '../nuclide-remote-connection';

export function observeBuffers(observeBuffer: (buffer: atom$TextBuffer) => mixed): IDisposable {
  return atom.project.observeBuffers(buffer => {
    if (!nuclideUri.isBrokenDeserializedUri(buffer.getPath())) {
      observeBuffer(buffer);
    }
  });
}

// Observes all buffer opens.
// Buffer renames are sent as an open of the new name.
export function observeBufferOpen(): Observable<atom$TextBuffer> {
  return observableFromSubscribeFunction(observeBuffers)
    .mergeMap(buffer => {
      const end = observableFromSubscribeFunction(buffer.onDidDestroy.bind(buffer));
      const rename = observableFromSubscribeFunction(buffer.onDidChangePath.bind(buffer))
        .map(() => buffer)
        .takeUntil(end);
      return Observable.of(buffer).concat(rename);
    });
}

// Note that on a rename, the openedPath will be the path of the buffer when the open was sent,
// which may not match the current name of the buffer.
export type CloseBufferEvent = {
  kind: 'close',
  openedPath: ?NuclideUri,
  buffer: atom$TextBuffer,
};

// Fires a single event when the buffer is destroyed or renamed.
// Note that on a rename the buffer path will not be the same as the openedPath.
export function observeBufferCloseOrRename(buffer: atom$TextBuffer): Observable<CloseBufferEvent> {
  const openedPath: ?NuclideUri = buffer.getPath();
  const end = observableFromSubscribeFunction(buffer.onDidDestroy.bind(buffer));
  const rename = observableFromSubscribeFunction(buffer.onDidChangePath.bind(buffer));
  return end.merge(rename)
    .take(1)
    .map(() => ({kind: 'close', buffer, openedPath}));
}

export async function loadBufferForUri(uri: NuclideUri): Promise<atom$TextBuffer> {
  let buffer = existingBufferForUri(uri);
  if (buffer == null) {
    buffer = createBufferForUri(uri);
  }
  if (buffer.loaded) {
    return buffer;
  }
  try {
    await buffer.load();
    return buffer;
  } catch (error) {
    atom.project.removeBuffer(buffer);
    throw error;
  }
}

/**
 * Returns an existing buffer for that uri, or create one if not existing.
 */
export function bufferForUri(uri: NuclideUri): atom$TextBuffer {
  const buffer = existingBufferForUri(uri);
  if (buffer != null) {
    return buffer;
  }
  return createBufferForUri(uri);
}

function createBufferForUri(uri: NuclideUri): atom$TextBuffer {
  let buffer;
  const params = {
    filePath: uri,
    shouldDestroyOnFileDelete: () => atom.config.get('core.closeDeletedFileTabs'),
  };
  if (nuclideUri.isLocal(uri)) {
    buffer = new TextBuffer(params);
  } else {
    const connection = ServerConnection.getForUri(uri);
    if (connection == null) {
      throw new Error(`ServerConnection cannot be found for uri: ${uri}`);
    }
    buffer = new NuclideTextBuffer(connection, params);
  }
  atom.project.addBuffer(buffer);
  invariant(buffer);
  return buffer;
}

/**
 * Returns an exsting buffer for that uri, or null if not existing.
 */
export function existingBufferForUri(uri: NuclideUri): ?atom$TextBuffer {
  return atom.project.findBufferForPath(uri);
}

/**
 * Provides an asynchronous interface for saving a buffer, regardless of whether it's an Atom
 * TextBuffer or NuclideTextBuffer.
 */
export async function save(buffer: atom$TextBuffer | NuclideTextBuffer): Promise<void> {
  const expectedPath = buffer.getPath();
  const promise = observableFromSubscribeFunction(buffer.onDidSave.bind(buffer))
    .filter(({path}) => path === expectedPath)
    .take(1)
    .ignoreElements()
    .toPromise();
  // `buffer.save` returns a promise in the case of a NuclideTextBuffer. We'll await it to make sure
  // we catch any async errors too.
  await Promise.resolve(buffer.save());
  return promise;
}
