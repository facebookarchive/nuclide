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

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import createPackage from 'nuclide-commons-atom/createPackage';
import RecentFilesService from './RecentFilesService';

export type FilePath = string;
export type TimeStamp = number;
export type FileList = Array<{path: FilePath, timestamp: TimeStamp}>;
export type RecentFilesSerializedState = {filelist?: FileList};

class Activation {
  _subscriptions: UniversalDisposable;
  _service: RecentFilesService;

  constructor(state: ?RecentFilesSerializedState) {
    this._service = new RecentFilesService(state);
    this._subscriptions = new UniversalDisposable(this._service);
  }

  provideRecentFilesService(): RecentFilesService {
    return this._service;
  }

  serialize(): Object {
    return {
      filelist: this._service.getRecentFiles(),
    };
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

createPackage(module.exports, Activation);
