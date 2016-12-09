/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {
  LocalFileEvent,
  FileVersion,
} from './rpc-types';

import {FileEventKind} from './constants';
import {Deferred} from '../../commons-node/promise';
import {MultiMap} from '../../commons-node/collection';

export class FileVersionNotifier {
  _versions: Map<NuclideUri, number>;
  _requests: MultiMap<NuclideUri, Request>;

  constructor() {
    this._versions = new Map();
    this._requests = new MultiMap();
  }

  // If any out of sync state is detected then an Error is thrown.
  // This will force the client to send a 'sync' event to get back on track.
  onEvent(event: LocalFileEvent): void {
    const filePath = event.fileVersion.filePath;
    const changeCount = event.fileVersion.version;
    switch (event.kind) {
      case FileEventKind.OPEN:
        this._versions.set(filePath, changeCount);
        break;
      case FileEventKind.CLOSE:
        this._versions.delete(filePath);
        break;
      case FileEventKind.EDIT:
        this._versions.set(filePath, changeCount);
        break;
      default:
        throw new Error(`Unexpected LocalFileEvent.kind: ${event.kind}`);
    }
    this._checkRequests(filePath);
  }

  dispose(): void {
    for (const request of this._requests.values()) {
      request.reject(createRejectError());
    }
  }

  getVersion(filePath: NuclideUri): ?number {
    return this._versions.get(filePath);
  }

  waitForBufferAtVersion(fileVersion: FileVersion): Promise<boolean> {
    const filePath = fileVersion.filePath;
    const version = fileVersion.version;
    const currentVersion = this._versions.get(filePath);
    if (currentVersion === version) {
      return Promise.resolve(true);
    } else if (currentVersion != null && currentVersion > version) {
      return Promise.resolve(false);
    }
    const request = new Request(filePath, version);
    this._requests.add(filePath, request);
    return request.promise;
  }

  _checkRequests(filePath: NuclideUri): void {
    const currentVersion = this._versions.get(filePath);
    if (currentVersion == null) {
      return;
    }

    const requests = Array.from(this._requests.get(filePath));
    const resolves = requests.filter(request => request.changeCount === currentVersion);
    const rejects = requests.filter(request => request.changeCount < currentVersion);
    const remaining = requests.filter(request => request.changeCount > currentVersion);
    this._requests.set(filePath, remaining);

    resolves.forEach(request => request.resolve(true));
    rejects.forEach(request => request.resolve(false));
  }
}

function createRejectError(): Error {
  return new Error('File modified past requested change');
}

class Request extends Deferred<boolean> {
  filePath: NuclideUri;
  changeCount: number;

  constructor(filePath: NuclideUri, changeCount: number) {
    super();

    this.filePath = filePath;
    this.changeCount = changeCount;
  }
}
