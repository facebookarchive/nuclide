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

import typeof * as JediService from './JediService';

import LRUCache from 'lru-cache';
import fsPromise from 'nuclide-commons/fsPromise';
import nuclideUri from 'nuclide-commons/nuclideUri';
import JediServer from './JediServer';
import LinkTreeManager from './LinkTreeManager';

export default class JediServerManager {
  _linkTreeManager: LinkTreeManager;
  _servers: LRUCache<string, JediServer>;
  _sysPathMap: Map<string, Array<string>>;

  constructor() {
    this._linkTreeManager = new LinkTreeManager();
    this._servers = new LRUCache({
      max: 20,
      dispose(key: string, val: JediServer) {
        val.dispose();
      },
    });
    this._sysPathMap = new Map();
  }

  getJediService(src: string): Promise<JediService> {
    let server = this._servers.get(src);
    if (server == null) {
      server = new JediServer(src);
      this._servers.set(src, server);
    }

    return server.getService();
  }

  /**
   * It's fine if the syspath changes over time.
   * We'll return partial results while we fetch the actual values.
   */
  getSysPath(src: string): Array<string> {
    const cachedSysPath = this._sysPathMap.get(src);
    if (cachedSysPath == null) {
      const sysPath = [];
      this._sysPathMap.set(src, sysPath);
      getTopLevelModulePath(src).then(result => {
        if (result != null) {
          sysPath.push(result);
        }
      });
      this._linkTreeManager.getLinkTreePaths(src).then(result => {
        sysPath.push(...result);
      });
      return sysPath;
    }
    return cachedSysPath;
  }

  reset(src: string): void {
    this._servers.del(src);
    this._linkTreeManager = new LinkTreeManager();
  }

  dispose(): void {
    this._servers.reset();
    this._sysPathMap.clear();
  }
}

function getTopLevelModulePath(src: string): Promise<?string> {
  return fsPromise.findFurthestFile(
    '__init__.py',
    nuclideUri.dirname(src),
    true /* stopOnMissing */,
  );
}
