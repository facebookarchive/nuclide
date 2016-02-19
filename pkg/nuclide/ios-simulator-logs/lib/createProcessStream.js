'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {observeProcess, safeSpawn} from '../../commons';
import invariant from 'assert';
import os from 'os';
import path from 'path';
import Rx from 'rx';

export function createProcessStream(): Rx.Observable<string> {
  return observeProcess(spawnTailProcess)
    .filter(event => event.kind === 'stdout')
    .map(event => (invariant(event.data != null), event.data));
}

function spawnTailProcess(): Promise<child_process$ChildProcess> {
  const logDir = path.join(
    os.homedir(),
    'Library',
    'Logs',
    'CoreSimulator',
    '721337CC-8D03-4BBC-8119-2DC710B05D14', // TODO: Don't hardcode this udid
    'asl',
  );
  return safeSpawn('syslog', [
    '-w',
    '-F', 'xml',
    '-d', logDir,
  ]);
}
