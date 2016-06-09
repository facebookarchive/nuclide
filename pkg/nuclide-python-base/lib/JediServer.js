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
import type {ProcessMaker} from '../../commons-node/RpcProcess';

import path from 'path';
import {safeSpawn} from '../../commons-node/process';
import RpcProcess from '../../commons-node/RpcProcess';
import {ServiceRegistry} from '../../nuclide-rpc';

const PYTHON_EXECUTABLE = 'python';
const LIB_PATH = path.join(__dirname, '../VendorLib');
const PROCESS_PATH = path.join(__dirname, '../python/jediserver.py');
const OPTS = {
  cwd: path.dirname(PROCESS_PATH),
  stdio: 'pipe',
  detached: false, // When Atom is killed, server process should be killed.
  env: {PYTHONPATH: LIB_PATH},
};

let serviceRegistry: ?ServiceRegistry = null;

function getServiceRegistry(): ServiceRegistry {
  if (serviceRegistry == null) {
    serviceRegistry = ServiceRegistry.createLocal([{
      name: 'JediService',
      definition: path.join(__dirname, 'JediService.js'),
      implementation: path.join(__dirname, 'JediService.js'),
      preserveFunctionNames: true,
    }]);
  }
  return serviceRegistry;
}

export default class JediServer {
  _process: RpcProcess;

  constructor(src: NuclideUri, pythonPath: string = PYTHON_EXECUTABLE) {
    // Generate a name for this server using the src file name, used to namespace logs
    const name = `JediServer-${path.basename(src)}`;
    const createProcess: ProcessMaker
      = () => safeSpawn(pythonPath, [PROCESS_PATH, '-s', src], OPTS);
    this._process = new RpcProcess(name, getServiceRegistry(), createProcess);
  }

  getService(): Promise<JediService> {
    return this._process.getService('JediService');
  }

  dispose(): void {
    this._process.dispose();
  }
}
