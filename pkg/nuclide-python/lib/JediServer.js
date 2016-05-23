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

import path from 'path';
import {safeSpawn} from '../../commons-node/process';
import RpcProcess from '../../commons-node/RpcProcess';

const PYTHON_EXECUTABLE = 'python';
const LIB_PATH = path.join(__dirname, '../VendorLib');
const PROCESS_PATH = path.join(__dirname, '../python/jediserver.py');
const OPTS = {
  cwd: path.dirname(PROCESS_PATH),
  stdio: 'pipe',
  detached: false, // When Atom is killed, server process should be killed.
  env: {PYTHONPATH: LIB_PATH},
};

export default class JediServer extends RpcProcess {

  constructor(src: NuclideUri, pythonPath: string = PYTHON_EXECUTABLE) {
    // Generate a name for this server using the src file name, used to namespace logs
    const name = `JediServer-${path.basename(src)}`;
    const createProcess = () => safeSpawn(pythonPath, [PROCESS_PATH, '-s', src], OPTS);
    super(name, createProcess);
  }

}
