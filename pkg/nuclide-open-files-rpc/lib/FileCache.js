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
  FileOpenEvent,
  FileCloseEvent,
  FileEditEvent,
  FileEvent,
  FileVersion,
  LocalFileEvent,
} from './rpc-types';

import TextBuffer from 'simple-text-buffer';
import invariant from 'assert';
import {BehaviorSubject, Subject, Observable} from 'rxjs';
import {FileVersionNotifier} from './FileVersionNotifier';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import nuclideUri from '../../commons-node/nuclideUri';

import {FileEventKind} from './constants';

export class FileCache {
  _buffers: Map<NuclideUri, simpleTextBuffer$TextBuffer>;
  _requests: FileVersionNotifier;
  _fileEvents: Subject<LocalFileEvent>;
  _directoryEvents: BehaviorSubject<Set<NuclideUri>>;
  _resources: UniversalDisposable;

  constructor() {
    this._buffers = new Map();
    this._fileEvents = new Subject();
    this._directoryEvents = new BehaviorSubject(new Set());
    this._requests = new FileVersionNotifier();

    this._resources = new UniversalDisposable();
    this._resources.add(this._requests);
    this._resources.add(this._fileEvents.subscribe(event => { this._requests.onEvent(event); }));
  }

  // If any out of sync state is detected then an Error is thrown.
  // This will force the client to send a 'sync' event to get back on track.
  onFileEvent(event: FileEvent): Promise<void> {
    const filePath = event.fileVersion.filePath;
    const changeCount = event.fileVersion.version;
    const buffer = this._buffers.get(filePath);
    switch (event.kind) {
      case FileEventKind.OPEN:
        invariant(buffer == null);
        this._open(filePath, event.contents, changeCount);
        break;
      case FileEventKind.CLOSE:
        if (buffer != null) {
          this._buffers.delete(filePath);
          this._emitClose(filePath, buffer);
          buffer.destroy();
        }
        break;
      case FileEventKind.EDIT:
        invariant(buffer != null);
        invariant(buffer.changeCount === (changeCount - 1));
        invariant(buffer.getTextInRange(event.oldRange) === event.oldText);
        buffer.setTextInRange(event.oldRange, event.newText);
        invariant(buffer.changeCount === changeCount);
        this._fileEvents.next(event);
        break;
      case FileEventKind.SYNC:
        if (buffer == null) {
          this._open(filePath, event.contents, changeCount);
        } else {
          this._syncEdit(filePath, buffer, event.contents, changeCount);
        }
        break;
      default:
        throw new Error(`Unexpected FileEvent.kind: ${event.kind}`);
    }
    return Promise.resolve(undefined);
  }

  async onDirectoriesChanged(openDirectories: Set<NuclideUri>): Promise<void> {
    this._directoryEvents.next(openDirectories);
  }

  _syncEdit(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
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
    this._fileEvents.next(createEditEvent(
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
    const newBuffer = new TextBuffer(contents);
    newBuffer.changeCount = changeCount;
    this._buffers.set(filePath, newBuffer);
    this._fileEvents.next(createOpenEvent(this.createFileVersion(filePath, changeCount), contents));
  }

  dispose(): void {
    for (const [filePath, buffer] of this._buffers.entries()) {
      this._emitClose(filePath, buffer);
      buffer.destroy();
    }
    this._buffers.clear();
    this._resources.dispose();
    this._fileEvents.complete();
    this._directoryEvents.complete();
  }

  getBuffer(filePath: NuclideUri): ?simpleTextBuffer$TextBuffer {
    return this._buffers.get(filePath);
  }

  async getBufferAtVersion(fileVersion: FileVersion): Promise<?simpleTextBuffer$TextBuffer> {
    if (!(await this._requests.waitForBufferAtVersion(fileVersion))) {
      return null;
    }
    const buffer = this.getBuffer(fileVersion.filePath);
    return buffer != null && buffer.changeCount === fileVersion.version ? buffer : null;
  }

  getOpenDirectories(): Set<NuclideUri> {
    return this._directoryEvents.getValue();
  }

  // Returns directory which contains this path if any.
  // Remote equivalent of atom.project.relativizePath()[1]
  // TODO: Return the most nested open directory.
  //       Note that Atom doesn't do this, though it should.
  getContainingDirectory(filePath: NuclideUri): ?NuclideUri {
    for (const dir of this.getOpenDirectories()) {
      if (nuclideUri.contains(dir, filePath)) {
        return dir;
      }
    }
    return null;
  }

  getOpenFiles(): Iterator<NuclideUri> {
    return this._buffers.keys();
  }

  observeFileEvents(): Observable<LocalFileEvent> {
    return Observable.from(
      Array.from(this._buffers.entries()).map(([filePath, buffer]) => {
        invariant(buffer != null);
        return createOpenEvent(
          this.createFileVersion(filePath, buffer.changeCount),
          buffer.getText());
      })).concat(this._fileEvents);
  }

  observeDirectoryEvents(): Observable<Set<NuclideUri>> {
    return this._directoryEvents;
  }

  _emitClose(filePath: NuclideUri, buffer: simpleTextBuffer$TextBuffer): void {
    this._fileEvents.next(createCloseEvent(
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
    kind: FileEventKind.OPEN,
    fileVersion,
    contents,
  };
}

function createCloseEvent(
  fileVersion: FileVersion,
): FileCloseEvent {
  return {
    kind: FileEventKind.CLOSE,
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
    kind: FileEventKind.EDIT,
    fileVersion,
    oldRange,
    oldText,
    newRange,
    newText,
  };
}
