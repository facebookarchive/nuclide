'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {WorkingSetsStore} from './WorkingSetsStore';

export class EmptyPathsObserver {
  _prevPaths: Array<string>;
  _workingSetsStore: WorkingSetsStore;

  constructor(workingSetsStore: WorkingSetsStore) {
    this._prevPaths = atom.project.getPaths();
    this._workingSetsStore = workingSetsStore;
  }

  onEmptyPaths(callback: () => void): IDisposable {
    return atom.project.onDidChangePaths((paths: Array<string>) => {
      this._didChangePaths(paths, callback);
    });
  }

  _didChangePaths(paths: Array<string>, emptyPathsCallback: () => void): void {
    const prevPaths = this._prevPaths;
    this._prevPaths = paths;

    const currentWs = this._workingSetsStore.getCurrent();
    const noneShown = !paths.some(p => currentWs.containsDir(p));
    if (noneShown) {
      emptyPathsCallback();
      return;
    }

    const addedPaths = paths.filter(p => prevPaths.indexOf(p) < 0);
    const pathChangeWasHidden = addedPaths.some(p => !currentWs.containsDir(p));

    // The user added a new project root and the currently active working sets did not let
    // it show. This would feel broken - better deactivate the working sets.
    if (pathChangeWasHidden) {
      emptyPathsCallback();
    }
  }
}
