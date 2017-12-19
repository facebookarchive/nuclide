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

import type {
  FileList,
  FilePath,
  TimeStamp,
  RecentFilesSerializedState,
} from '..';
import type {LRUCache} from 'lru-cache';

import LRU from 'lru-cache';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

export default class RecentFilesService {
  // Map uses `Map`'s insertion ordering to keep files in order.
  _fileList: LRUCache<FilePath, TimeStamp>;
  _subscriptions: UniversalDisposable;

  constructor(state: ?RecentFilesSerializedState) {
    this._fileList = LRU({max: 100});
    if (state != null && state.filelist != null) {
      // Serialized state is in reverse chronological order. Reverse it to insert items correctly.
      state.filelist.reduceRight((_, fileItem) => {
        this._fileList.set(fileItem.path, fileItem.timestamp);
      }, null);
    }
    this._subscriptions = new UniversalDisposable();
    this._subscriptions.add(
      atom.workspace.onDidChangeActivePaneItem((item: ?mixed) => {
        // Not all `item`s are instances of TextEditor (e.g. the diff view).
        // flowlint-next-line sketchy-null-mixed:off
        if (!item || typeof item.getPath !== 'function') {
          return;
        }
        const editorPath = item.getPath();
        if (editorPath != null) {
          this.touchFile(editorPath);
        }
      }),
    );
  }

  touchFile(path: string): void {
    this._fileList.set(path, Date.now());
  }

  /**
   * Returns a reverse-chronological list of recently opened files.
   */
  getRecentFiles(): FileList {
    return this._fileList.dump().map(({k, v}) => ({
      resultType: 'FILE',
      path: k,
      timestamp: v,
    }));
  }

  dispose() {
    this._subscriptions.dispose();
  }
}
