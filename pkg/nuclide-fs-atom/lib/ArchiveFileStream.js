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

import {Emitter} from 'atom';
import {ROOT_FS, FileSystem} from '../../nuclide-fs';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

export type EventName = 'data' | 'end' | 'error';

export class ArchiveFileStream {
  _fs: FileSystem;
  _path: string;
  _emitter: ?Emitter;

  constructor(path: string, fs: FileSystem = ROOT_FS) {
    this._fs = fs;
    this._path = path;
    this._emitter = null;
  }

  on(eventName: EventName, callback: (v: any) => mixed): IDisposable {
    const emitter = this._emitter || new Emitter();
    if (this._emitter == null) {
      this._emitter = emitter;
      const disposer = new UniversalDisposable(emitter);
      const o = this._fs.createReadStream(this._path);
      disposer.add(
        o.subscribe(
          buffer => emitter.emit('data', buffer),
          error => {
            emitter.emit('error', error);
            disposer.dispose();
          },
          () => {
            emitter.emit('end');
            disposer.dispose();
          },
        ),
        o.connect(),
      );
    }
    return emitter.on(eventName, callback);
  }
}
