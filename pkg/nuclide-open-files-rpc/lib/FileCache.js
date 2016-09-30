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
import type {
  FileOpenEvent,
  FileCloseEvent,
  FileEditEvent,
  FileEvent,
  FileVersion,
} from './rpc-types';

import TextBuffer from 'simple-text-buffer';
import invariant from 'assert';
import {Deferred} from '../../commons-node/promise';
import {MultiMap} from '../../commons-node/collection';
import {Subject, Observable} from 'rxjs';

export type LocalFileEvent = FileOpenEvent | FileCloseEvent | FileEditEvent;

export class FileCache {
  _buffers: Map<NuclideUri, atom$TextBuffer>;
  _requests: MultiMap<NuclideUri, Request>;
  _events: Subject<LocalFileEvent>;

  constructor() {
    this._buffers = new Map();
    this._requests = new MultiMap();
    this._events = new Subject();
  }

  // If any out of sync state is detected then an Error is thrown.
  // This will force the client to send a 'sync' event to get back on track.
  onEvent(event: FileEvent): Promise<void> {
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
        this._emitClose(filePath, buffer);
        buffer.destroy();
        break;
      case 'edit':
        invariant(buffer != null);
        invariant(buffer.changeCount === (changeCount - 1));
        invariant(buffer.getTextInRange(event.oldRange) === event.oldText);
        buffer.setTextInRange(event.oldRange, event.newText);
        invariant(buffer.changeCount === changeCount);
        this._events.next(event);
        break;
      case 'sync':
        if (buffer == null) {
          this._open(filePath, event.contents, changeCount);
        } else {
          this._syncEdit(filePath, buffer, event.contents, changeCount);
        }
        break;
      default:
        throw new Error(`Unexpected FileEvent.kind: ${event.kind}`);
    }
    this._checkRequests(filePath);
    return Promise.resolve(undefined);
  }

  _syncEdit(
    filePath: NuclideUri,
    buffer: atom$TextBuffer,
    contents: string,
    changeCount: number,
  ): void {
    // messages are out of order
    if (changeCount < buffer.changeCount) {
      return;
    }

    const oldText = buffer.getText();
    const oldRange = buffer.getRange();
    buffer.setText(contents);
    const newRange = buffer.getRange();
    buffer.changeCount = changeCount;
    this._events.next(createEditEvent(
      this.createFileVersion(filePath, changeCount),
      oldRange,
      oldText,
      newRange,
      buffer.getText(),
    ));
  }

  _open(filePath: NuclideUri, contents: string, changeCount: number): void {
    // We never call setPath on these TextBuffers as that will
    // start the TextBuffer attempting to sync with the file system.
    const newBuffer: atom$TextBuffer = new TextBuffer(contents);
    newBuffer.changeCount = changeCount;
    this._buffers.set(filePath, newBuffer);
    this._events.next(createOpenEvent(this.createFileVersion(filePath, changeCount), contents));
  }

  dispose(): void {
    for (const filePath of this._buffers.keys()) {
      const buffer = this._buffers.get(filePath);
      invariant(buffer != null);
      this._emitClose(filePath, buffer);
      buffer.destroy();
    }
    for (const request of this._requests.values()) {
      request.reject(createRejectError());
    }
    this._events.complete();
  }

  getBuffer(filePath: NuclideUri): ?atom$TextBuffer {
    return this._buffers.get(filePath);
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
    const requests = Array.from(this._requests.get(filePath));

    const resolves = requests.filter(request => request.changeCount === buffer.changeCount);
    const rejects = requests.filter(request => request.changeCount < buffer.changeCount);
    const remaining = requests.filter(request => request.changeCount > buffer.changeCount);
    this._requests.set(filePath, remaining);

    resolves.forEach(request => request.resolve(buffer));
    rejects.forEach(request => request.reject(createRejectError()));
  }

  observeFileEvents(): Observable<LocalFileEvent> {
    return Observable.from(
      Array.from(this._buffers.entries()).map(([filePath, buffer]) => {
        invariant(buffer != null);
        return createOpenEvent(
          this.createFileVersion(filePath, buffer.changeCount),
          buffer.getText());
      })).concat(this._events);
  }

  _emitClose(filePath: NuclideUri, buffer: atom$TextBuffer): void {
    this._events.next(createCloseEvent(
      this.createFileVersion(filePath, buffer.changeCount)));
  }

  createFileVersion(
    filePath: NuclideUri,
    version: number,
  ): FileVersion {
    return {
      notifier: this,
      filePath,
      version,
    };
  }
}

function createOpenEvent(
  fileVersion: FileVersion,
  contents: string,
): FileOpenEvent {
  return {
    kind: 'open',
    fileVersion,
    contents,
  };
}

function createCloseEvent(
  fileVersion: FileVersion,
): FileCloseEvent {
  return {
    kind: 'close',
    fileVersion,
  };
}

function createEditEvent(
  fileVersion: FileVersion,
  oldRange: atom$Range,
  oldText: string,
  newRange: atom$Range,
  newText: string,
): FileEditEvent {
  return {
    kind: 'edit',
    fileVersion,
    oldRange,
    oldText,
    newRange,
    newText,
  };
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
