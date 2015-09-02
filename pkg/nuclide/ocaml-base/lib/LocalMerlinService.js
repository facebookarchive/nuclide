'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from 'nuclide-remote-uri';

var {
  checkOutput,
  findNearestFile,
  safeSpawn,
} = require('nuclide-commons');

var logger = require('nuclide-logging').getLogger();

var MerlinService = require('./MerlinService');
var MerlinProcess = require('./MerlinProcess');

/**
 * @return The path to ocamlmerlin on the user's machine. It is recommended not to cache the result
 *   of this function in case the user updates his or her preferences in Atom, in which case the
 *   return value will be stale.
 */
function getPathToMerlin(): string {
  if (global.atom) {
    return atom.config.get('nuclide-ocaml.pathToMerlin');
  } else {
    return 'ocamlmerlin';
  }
}

var isInstalledCache: ?boolean = null;
async function isInstalled(merlinPath: string): Promise<boolean> {
  if (isInstalledCache == null) {
    var result = await checkOutput('which', [merlinPath]);
    isInstalledCache = result.exitCode === 0;
    if (!isInstalledCache) {
      logger.info('ocamlmerlin not installed');
    }
  }
  return isInstalledCache;
}

class LocalMerlinService extends MerlinService {
  _merlinProcessInstance: ?MerlinProcess;

  async _getInstance(file: NuclideUri): Promise<?MerlinProcess> {
    if (this._merlinProcessInstance && this._merlinProcessInstance.isRunning()) {
      return this._merlinProcessInstance;
    }

    var merlinPath = getPathToMerlin();

    if (!await isInstalled(merlinPath)) {
      return null;
    }

    var dotMerlinPath = await findNearestFile('.merlin', file);

    var options = {
      cwd: (dotMerlinPath ? require('path').dirname(dotMerlinPath) : '.'),
    };

    logger.info('Spawning new ocamlmerlin process');
    var process = await safeSpawn(merlinPath, [], options);
    this._merlinProcessInstance = new MerlinProcess(process);

    if (dotMerlinPath) {
      // TODO(pieter) add support for multiple .dotmerlin files
      await this._merlinProcessInstance.pushDotMerlinPath(dotMerlinPath);
      logger.debug('Added .merlin path: ' + dotMerlinPath);
    }

    return this._merlinProcessInstance;
  }

  async pushDotMerlinPath(path: NuclideUri): Promise<?mixed> {
    var instance = await this._getInstance(path);
    return instance ? instance.pushDotMerlinPath(path) : null;
  }

  async pushNewBuffer(name: NuclideUri, content: string): Promise<?mixed> {
    var instance = await this._getInstance(name);
    return instance ? instance.pushNewBuffer(name, content) : null;
  }

  async locate(path: NuclideUri, line: number, col: number, kind: string): Promise<?{file: NuclideUri}> {
    var instance = await this._getInstance(path);
    return instance ? instance.locate(path, line, col, kind) : null;
  }

  async complete(path: NuclideUri, line: number ,col: number, prefix: string): Promise<mixed> {
    var instance = await this._getInstance(path);
    return instance ? instance.complete(path, line, col, prefix) : null;
  }
}

module.exports = LocalMerlinService;
