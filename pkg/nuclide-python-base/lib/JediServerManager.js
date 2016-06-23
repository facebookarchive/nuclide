'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import typeof * as JediService from './JediService';

import LRUCache from 'lru-cache';
import JediServer from './JediServer';
import LinkTreeManager from './LinkTreeManager';


async function getServerArgs(src: string) {
  let overrides = {};
  try {
    // Override the python path and additional sys paths
    // if override script is present.
    overrides = await require('./fb/find-jedi-server-args')(src);
  } catch (e) {
    // Ignore.
  }

  return {
    // Default to assuming that python is in system PATH.
    pythonPath: 'python',
    paths: [],
    ...overrides,
  };
}

export default class JediServerManager {

  _linkTreeManager: LinkTreeManager;
  _servers: LRUCache<NuclideUri, JediServer>;

  constructor() {
    this._linkTreeManager = new LinkTreeManager();
    this._servers = new LRUCache({
      max: 20,
      dispose(key: NuclideUri, val: JediServer) {
        val.dispose();
      },
    });
  }

  async getJediService(src: NuclideUri): Promise<JediService> {
    let server = this._servers.get(src);
    if (server == null) {
      const {pythonPath, paths} = await getServerArgs(src);
      // Create a JediServer using default python path.
      server = new JediServer(src, pythonPath, paths);
      this._servers.set(src, server);

      // Add link tree path without awaiting so we don't block the service
      // from returning.
      this._addLinkTreePaths(src, server);
    }

    return await server.getService();
  }

  async _addLinkTreePaths(src: NuclideUri, server: JediServer): Promise<void> {
    const linkTreePaths = await this._linkTreeManager.getLinkTreePaths(src);
    if (server.isDisposed() || linkTreePaths.length === 0) {
      return;
    }
    const service = await server.getService();
    await service.add_paths(linkTreePaths);
  }

  reset(src: string): void {
    this._servers.del(src);
    this._linkTreeManager.reset(src);
  }

  dispose(): void {
    this._servers.reset();
    this._linkTreeManager.dispose();
  }

}
