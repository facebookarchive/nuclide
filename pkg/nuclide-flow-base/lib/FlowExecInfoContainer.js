'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LRUCache} from 'lru-cache';

import LRU from 'lru-cache';

import nuclideUri from '../../nuclide-remote-uri';
import {checkOutput} from '../../commons-node/process';
import fsPromise from '../../commons-node/fsPromise';

// All the information needed to execute Flow in a given root. The path to the Flow binary we want
// to use may vary per root -- for now, only if we are using the version of Flow from `flow-bin`.
// The options also vary, right now only because they set the cwd to the current Flow root.
export type FlowExecInfo = {
  pathToFlow: string,
  execOptions: Object,
};

export class FlowExecInfoContainer {

  // Map from file path to the closest ancestor directory containing a .flowconfig file (the file's
  // Flow root)
  _flowConfigDirCache: LRUCache<string, ?string>;

  // Map from Flow root directory (or null for "no root" e.g. files outside of a Flow root, or
  // unsaved files. Useful for outline view) to FlowExecInfo. A null value means that the Flow
  // binary cannot be found for that root. It is possible for Flow to be available in some roots but
  // not others because we will support root-specific installations of flow-bin.
  _flowExecInfoCache: LRUCache<?string, ?FlowExecInfo>;

  constructor() {
    this._flowConfigDirCache = LRU({
      max: 10,
      maxAge: 1000 * 30, // 30 seconds
    });

    this._flowExecInfoCache = LRU({
      max: 10,
      maxAge: 1000 * 30, // 30 seconds
    });
  }

  dispose() {
    this._flowConfigDirCache.reset();
    this._flowExecInfoCache.reset();
  }

  // Returns null iff Flow cannot be found.
  async getFlowExecInfo(root: string | null): Promise<?FlowExecInfo> {
    if (!this._flowExecInfoCache.has(root)) {
      const info = await this._computeFlowExecInfo(root);
      this._flowExecInfoCache.set(root, info);
    }
    return this._flowExecInfoCache.get(root);
  }

  async _computeFlowExecInfo(root: string | null): Promise<?FlowExecInfo> {
    const flowPath = getPathToFlow();
    if (!await canFindFlow(flowPath)) {
      return null;
    }
    return {
      pathToFlow: flowPath,
      execOptions: getFlowExecOptions(root),
    };
  }

  async findFlowConfigDir(localFile: string): Promise<?string> {
    if (!this._flowConfigDirCache.has(localFile)) {
      const flowConfigDir =
        await fsPromise.findNearestFile('.flowconfig', nuclideUri.dirname(localFile));
      this._flowConfigDirCache.set(localFile, flowConfigDir);
    }
    return this._flowConfigDirCache.get(localFile);
  }
}

async function canFindFlow(flowPath: string): Promise<boolean> {
  try {
    // https://github.com/facebook/nuclide/issues/561
    await checkOutput(process.platform === 'win32' ? 'where' : 'which', [flowPath]);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * @return The path to Flow on the user's machine. It is recommended not to cache the result of this
 *   function in case the user updates his or her preferences in Atom, in which case the return
 *   value will be stale.
 */
function getPathToFlow(): string {
  // $UPFixMe: This should use nuclide-features-config
  // Does not currently do so because this is an npm module that may run on the server.
  return global.atom && global.atom.config.get('nuclide.nuclide-flow.pathToFlow') || 'flow';
}

// `string | null` forces the presence of an explicit argument (`?string` allows undefined which
// means the argument can be left off altogether.
function getFlowExecOptions(root: string | null): Object {
  return {
    cwd: root,
    env: {
      // Allows backtrace to be printed:
      // http://caml.inria.fr/pub/docs/manual-ocaml/runtime.html#sec279
      OCAMLRUNPARAM: 'b',
      // Put this after so that if the user already has something set for OCAMLRUNPARAM we use
      // that instead. They probably know what they're doing.
      ...process.env,
    },
  };
}
