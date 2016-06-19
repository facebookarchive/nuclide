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

// Cache the pythonPath on first execution so we don't rerun overrides script
// everytime.
let pythonPath;
async function getPythonPath() {
  if (pythonPath) {
    return pythonPath;
  }
  // Default to assuming that python is in system PATH.
  pythonPath = 'python';
  try {
    // Override the python path if override script is present.
    const overrides = await require('./fb/find-jedi-server-args')();
    if (overrides.pythonExecutable) {
      pythonPath = overrides.pythonExecutable;
    }
  } catch (e) {
    // Ignore.
  }
  return pythonPath;
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
      // Create a JediServer using default python path.
      server = new JediServer(src, await getPythonPath());
      this._servers.set(src, server);

      // Add link tree path without awaiting so we don't block the service
      // from returning.
      this._addLinkTreePath(src, server);
    }

    return await server.getService();
  }

  async _addLinkTreePath(src: NuclideUri, server: JediServer): Promise<void> {
    const linkTreePath = await this._linkTreeManager.getLinkTreePath(src);
    if (server.isDisposed() || linkTreePath == null) {
      return;
    }
    const service = await server.getService();
    await service.add_paths([linkTreePath]);
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
