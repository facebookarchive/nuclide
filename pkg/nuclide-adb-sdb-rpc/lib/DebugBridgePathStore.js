/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {checkOutput} from '../../commons-node/process';
import {asyncFind} from '../../commons-node/promise';
import {arrayUnique} from '../../commons-node/collection';

import type {DebugBridgeType} from './types';

export type DBPath = {path: string, priority: number};

class DebugBridgePathStore {
  _registeredPaths: Map<string, DBPath>;
  _sortedPaths: string[];
  _lastWorkingPath: ?string;

  constructor() {
    this._registeredPaths = new Map();
    this._sortedPaths = [];
    this._lastWorkingPath = null;
  }

  registerPath(id: string, dbPath: DBPath): void {
    this._registeredPaths.set(id, dbPath);
    this._sortedPaths = Array.from(this._registeredPaths.values())
      .sort((a, b) => b.priority - a.priority)
      .map(_dbPath => _dbPath.path);
  }

  getPaths(): string[] {
    if (this._lastWorkingPath == null) {
      return this._sortedPaths;
    }
    return arrayUnique([this._lastWorkingPath].concat(...this._sortedPaths));
  }

  notifyWorkingPath(workingPath: ?string): void {
    this._lastWorkingPath = workingPath;
  }
}

const pathStore = new Map();

export function getStore(db: DebugBridgeType): DebugBridgePathStore {
  let cached = pathStore.get(db);
  if (cached == null) {
    cached = new DebugBridgePathStore(db);
    cached.registerPath('default', {path: db, priority: -1});
    pathStore.set(db, cached);
  }
  return cached;
}

export async function pathForDebugBridge(db: DebugBridgeType): Promise<string> {
  const store = getStore(db);
  const workingPath = await asyncFind(
    store.getPaths(),
    async path => {
      try {
        await checkOutput(path, ['start-server']);
        return path;
      } catch (e) {
        return null;
      }
    },
  );
  store.notifyWorkingPath(workingPath);
  if (workingPath != null) {
    return workingPath;
  }
  throw new Error(
    `${db} is unavailable. Add it to your path and restart nuclide or make sure that ` +
    `'${db} start-server' works.`,
  );
}
