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

import TextBuffer from 'simple-text-buffer';
import invariant from 'assert';

export class FileCache {
  _buffers: Map<NuclideUri, atom$TextBuffer>;

  constructor() {
    this._buffers = new Map();
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
    this._buffers = new Map();
  }
}
