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

import {runCommand} from '../../commons-node/process';
import {asyncFind, lastly} from 'nuclide-commons/promise';
import {arrayUnique} from 'nuclide-commons/collection';

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
    const lastWorkingPath = this._lastWorkingPath;
    if (lastWorkingPath == null) {
      return this._sortedPaths;
    }
    return arrayUnique([lastWorkingPath, ...this._sortedPaths]);
  }

  notifyWorkingPath(workingPath: ?string): void {
    this._lastWorkingPath = workingPath;
  }
}

const pathStore = new Map();

export function getStore(db: DebugBridgeType): DebugBridgePathStore {
  let cached = pathStore.get(db);
  if (cached == null) {
    cached = new DebugBridgePathStore();
    cached.registerPath('default', {path: db, priority: -1});
    pathStore.set(db, cached);
  }
  return cached;
}

const runningPromises: Map<string, Promise<string>> = new Map();

// Ensure only one call is executed at a time
function reusePromiseUntilResolved(
  id: string,
  cb: () => Promise<string>,
): Promise<string> {
  let runningPromise = runningPromises.get(id);
  if (runningPromise == null) {
    runningPromise = lastly(cb(), () => {
      runningPromises.delete(id);
    });
    runningPromises.set(id, runningPromise);
  }
  return runningPromise;
}

export function pathForDebugBridge(db: DebugBridgeType): Promise<string> {
  return reusePromiseUntilResolved(db, async () => {
    const store = getStore(db);
    const workingPath = await asyncFind(store.getPaths(), async path => {
      try {
        await runCommand(path, ['start-server']).toPromise();
        return path;
      } catch (e) {
        return null;
      }
    });
    if (workingPath == null) {
      throw new Error(
        `${db} is unavailable. Add it to your path and restart nuclide or make sure that ` +
          `'${db} start-server' works.`,
      );
    }
    store.notifyWorkingPath(workingPath);
    return workingPath;
  });
}
