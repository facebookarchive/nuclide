'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {findFlowConfigDir} from './FlowHelpers';

import {FlowRoot} from './FlowRoot';

export class FlowRootContainer {
  // string rather than NuclideUri because this module will always execute at the location of the
  // file, so it will always be a real path and cannot be prefixed with nuclide://
  _flowRoots: Map<string, FlowRoot>;

  constructor() {
    this._flowRoots = new Map();
  }

  async getRootForPath(path: string): Promise<?FlowRoot> {
    const rootPath = await findFlowConfigDir(path);
    if (rootPath == null) {
      return null;
    }

    let instance = this._flowRoots.get(rootPath);
    if (!instance) {
      instance = new FlowRoot(rootPath);
      this._flowRoots.set(rootPath, instance);
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
    return this._flowRoots.values();
  }

  clear(): void {
    this._flowRoots.forEach(instance => instance.dispose());
    this._flowRoots.clear();
  }
}
