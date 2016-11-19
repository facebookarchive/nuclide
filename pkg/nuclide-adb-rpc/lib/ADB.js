'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {ConnectableObservable} from 'rxjs';
import {runCommand} from '../../commons-node/process';

export function startServer(
  adbPath: NuclideUri,
): ConnectableObservable<string> {
  return runCommand(adbPath, ['start-server']).publish();
}

export function getDeviceList(
  adbPath: NuclideUri,
): ConnectableObservable<Array<string>> {
  return runCommand(adbPath, ['devices'])
    .map(stdout => stdout.split(/n+/g)
                     .slice(1)
                     .filter(s => s.length > 0)
                     .map(s => s.split(/\s+/g)[0]))
    .publish();
}
