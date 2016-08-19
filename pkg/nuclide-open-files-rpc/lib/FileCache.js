'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {FileEvent} from './rpc-types';
import type {FileVersion} from '../../nuclide-open-files-common/lib/rpc-types';

import TextBuffer from 'simple-text-buffer';
import invariant from 'assert';
import {Deferred} from '../../commons-node/promise';
import {MultiMap} from '../../commons-node/collection';

export class FileCache {
  _buffers: Map<NuclideUri, atom$TextBuffer>;
  _requests: MultiMap<NuclideUri, Request>;

  constructor() {
    this._buffers = new Map();
    this._requests = new MultiMap();
  }

  // If any out of sync state is detected then an Error is thrown.
  // This will force the client to send a 'sync' event to get back on track.
  onEvent(event: FileEvent): void {
    const filePath = event.fileVersion.filePath;
    const changeCount = event.fileVersion.version;
    const buffer = this._buffers.get(filePath);
    switch (event.kind) {
      case 'open':
        invariant(buffer == null);
        this._open(filePath, event.contents, changeCount);
        break;
      case 'close':
        invariant(buffer != null);
        this._buffers.delete(filePath);
        buffer.destroy();
        break;
      case 'edit':
        invariant(buffer != null);
        invariant(buffer.changeCount === (changeCount - 1));
        const oldRange: atom$RangeObject = event.oldRange;
        invariant(buffer.getTextInRange(oldRange) === event.oldText);
        buffer.setTextInRange(oldRange, event.newText);
        invariant(buffer.changeCount === changeCount);
        break;
      case 'sync':
        if (buffer == null) {
          this._open(filePath, event.contents, changeCount);
        } else {
          buffer.setText(event.contents);
          buffer.changeCount = changeCount;
        }
        break;
      default:
        throw new Error(`Unexpected FileEvent.kind: ${event.kind}`);
    }
    this._checkRequests(filePath);
  }

  _open(filePath: NuclideUri, contents: string, changeCount: number): void {
    // We never call setPath on these TextBuffers as that will
    // start the TextBuffer attempting to sync with the file system.
    const newBuffer: atom$TextBuffer = new TextBuffer(contents);
    newBuffer.changeCount = changeCount;
    this._buffers.set(filePath, newBuffer);
  }

  dispose(): void {
    for (const buffer of this._buffers.values()) {
      buffer.destroy();
    }
    for (const request of this._requests.values()) {
      request.reject(createRejectError());
    }

    this._buffers = new Map();
    this._requests.clear();
  }

  getBufferAtVersion(fileVersion: FileVersion): Promise<atom$TextBuffer> {
    const filePath = fileVersion.filePath;
    const version = fileVersion.version;
    const currentBuffer = this._buffers.get(filePath);
    if (currentBuffer != null && currentBuffer.changeCount === version) {
      return Promise.resolve(currentBuffer);
    } else if (currentBuffer != null && currentBuffer.changeCount > version) {
      return Promise.reject(createRejectError());
    }
    const request = new Request(filePath, version);
    this._requests.add(filePath, request);
    return request.promise;
  }

  _checkRequests(filePath: NuclideUri): void {
    const buffer = this._buffers.get(filePath);
    if (buffer == null) {
      return;
    }
    // $FlowIssue - Sets and iterable
    const requests = [...this._requests.get(filePath)];

    const resolves = requests.filter(request => request.changeCount === buffer.changeCount);
    const rejects = requests.filter(request => request.changeCount < buffer.changeCount);
    const remaining = requests.filter(request => request.changeCount > buffer.changeCount);
    if (remaining.length === 0) {
      this._requests.deleteAll(filePath);
    } else {
      this._requests.set(filePath, remaining);
    }

    resolves.forEach(request => request.resolve(buffer));
    rejects.forEach(request => request.reject(createRejectError()));
  }
}

function createRejectError(): Error {
  return new Error('File modified past requested change');
}

class Request extends Deferred<atom$TextBuffer> {
  filePath: NuclideUri;
  changeCount: number;

  constructor(filePath: NuclideUri, changeCount: number) {
    super();

    this.filePath = filePath;
    this.changeCount = changeCount;
  }
}
