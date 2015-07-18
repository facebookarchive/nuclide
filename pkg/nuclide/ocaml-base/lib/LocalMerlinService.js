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

var {getConfigValueAsync, findNearestFile, asyncFind} = require('nuclide-commons');
var MerlinService = require('./MerlinService');
var MerlinProcess = require('./MerlinProcess');

function getPathToMerlin(): Promise<string> {
  if (global.atom) {
    return getConfigValueAsync('nuclide-ocaml.pathToMerlin')();
  } else {
    return Promise.resolve('ocamlmerlin');
  }
}

class LocalMerlinService extends MerlinService {
  _merlinProcessInstance: ?MerlinProcess;

  async _getInstance(file: NuclideUri): Promise<MerlinProcess> {
    if (this._merlinProcessInstance && this._merlinProcessInstance.isRunning()) {
      return this._merlinProcessInstance;
    }

    var logger = require('nuclide-logging').getLogger();
    logger.debug('Spawning new ocamlmerlin process');

    var merlinPath = await getPathToMerlin();

    var dotMerlinPath = await findNearestFile('.merlin', file);

    var options = {
      cwd: (dotMerlinPath ? require('path').dirname(dotMerlinPath) : '.'),
    };
    var process = require('child_process').spawn(merlinPath, [], options);
    this._merlinProcessInstance = new MerlinProcess(process);

    if (dotMerlinPath) {
      // TODO(pieter) add support for multiple .dotmerlin files
      await this._merlinProcessInstance.pushDotMerlinPath(dotMerlinPath);
      logger.debug('Added .merlin path: ' + dotMerlinPath);
    }

    return this._merlinProcessInstance;
  }

  async pushDotMerlinPath(path: NuclideUri): Promise<mixed> {
    return (await this._getInstance(path)).pushDotMerlinPath(path);
  }
  async pushNewBuffer(name: NuclideUri, content: string): Promise<mixed> {
    return (await this._getInstance(name)).pushNewBuffer(name, content);
  }
  async locate(path: NuclideUri, line: number, col: number, kind: string): Promise<{file: NuclideUri}> {
    return (await this._getInstance(path)).locate(path, line, col, kind);
  }
}

module.exports = LocalMerlinService;
