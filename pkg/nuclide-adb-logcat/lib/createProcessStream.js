'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {observeProcess, safeSpawn} from '../../nuclide-commons';
import featureConfig from '../../nuclide-feature-config';
import Rx from 'rx';

export function createProcessStream(): Rx.Observable<string> {
  return observeProcess(spawnAdbLogcat)
    .map(event => {
      if (event.kind === 'exit') {
        throw new Error('adb logcat exited unexpectedly');
      }
      return event;
    })

    // Only get the text from stdout.
    .filter(event => event.kind === 'stdout')
    .map(event => event.data && event.data.replace(/\r?\n$/, ''))

    // Skip the single historical log. Adb requires us to have at least one (`-T`) but (for now at
    // least) we only want to show live logs. Also, since we're automatically retrying, displaying
    // it would mean users would get an inexplicable old entry.
    .skip(1);
}

function spawnAdbLogcat(): Promise<child_process$ChildProcess> {
  return safeSpawn(
    ((featureConfig.get('nuclide-adb-logcat.pathToAdb'): any): string),
    ['logcat', '-v', 'long', '-T', '1']
  );
}
