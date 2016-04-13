'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from '@reactivex/rxjs';
import type {ServerStatusUpdate} from '..';

import {Subject} from '@reactivex/rxjs';

import {findFlowConfigDir} from './FlowHelpers';
import {FlowRoot} from './FlowRoot';

export class FlowRootContainer {
  // string rather than NuclideUri because this module will always execute at the location of the
  // file, so it will always be a real path and cannot be prefixed with nuclide://
  _flowRootMap: Map<string, FlowRoot>;

  _flowRoot$: Subject<FlowRoot>;

  constructor() {
    this._flowRootMap = new Map();

    // No need to dispose of this subscription since we want to keep it for the entire life of this
    // object. When this object is garbage collected the subject should be too.
    this._flowRoot$ = new Subject();
    this._flowRoot$.subscribe(flowRoot => {
      this._flowRootMap.set(flowRoot.getPathToRoot(), flowRoot);
    });
  }

  async getRootForPath(path: string): Promise<?FlowRoot> {
    const rootPath = await findFlowConfigDir(path);
    if (rootPath == null) {
      return null;
    }

    let instance = this._flowRootMap.get(rootPath);
    if (!instance) {
      instance = new FlowRoot(rootPath);
      this._flowRoot$.next(instance);
    }
    return instance;
  }

  async runWithRoot<T>(
    file: string,
    f: (instance: FlowRoot) => Promise<T>,
  ): Promise<?T> {
    const instance = await this.getRootForPath(file);
    if (instance == null) {
      return null;
    }

    return await f(instance);
  }

  getAllRoots(): Iterable<FlowRoot> {
    return this._flowRootMap.values();
  }

  getServerStatusUpdates(): Observable<ServerStatusUpdate> {
    return this._flowRoot$.flatMap(root => {
      const pathToRoot = root.getPathToRoot();
      // The status update stream will be completed when a root is disposed, so there is no need to
      // use takeUntil here to truncate the stream and release resources.
      return root.getServerStatusUpdates().map(status => ({pathToRoot, status}));
    });
  }

  clear(): void {
    this._flowRootMap.forEach(instance => instance.dispose());
    this._flowRootMap.clear();
  }
}
