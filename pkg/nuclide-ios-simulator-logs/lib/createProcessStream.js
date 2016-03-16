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
import invariant from 'assert';
import os from 'os';
import path from 'path';
import Rx from 'rx';

export function createProcessStream(): Rx.Observable<string> {
  // Get a list of devices and their states from `xcrun simctl`.
  const simctlOutput$ = observeProcess(spawnSimctlList)
    .filter(event => event.kind === 'stdout')
    .map(event => (invariant(event.data != null), event.data))
    .reduce((acc, next) => acc + next, '')
    .map(rawJson => JSON.parse(rawJson));

  const udid$ = simctlOutput$
    .map(json => {
      const {devices} = json;
      const device = _findAvailableDevice(devices);
      if (device == null) {
        throw new Error('No active iOS simulator found');
      }
      return device.udid;
    })
    // Retry every second until we find an active device.
    .retryWhen(error$ => error$.delay(1000));

  return udid$
    .first()
    .flatMap(udid => (
      observeProcess(() => tailDeviceLogs(udid))
        .filter(event => event.kind === 'stdout')
        .map(event => (invariant(event.data != null), event.data))
    ));
}

/**
 * Finds the first booted available device in a list of devices (formatted in the output style of
 * `simctl`.). Exported for testing only.
 */
export function _findAvailableDevice(devices: Object): ?Object {
  for (const key of Object.keys(devices)) {
    for (const device of devices[key]) {
      if (device.availability === '(available)' && device.state === 'Booted') {
        return device;
      }
    }
  }
}

function spawnSimctlList(): Promise<child_process$ChildProcess> {
  return safeSpawn('xcrun', [
    'simctl',
    'list',
    '--json',
  ]);
}

function tailDeviceLogs(udid: string): Promise<child_process$ChildProcess> {
  const logDir = path.join(
    os.homedir(),
    'Library',
    'Logs',
    'CoreSimulator',
    udid,
    'asl',
  );
  return safeSpawn('syslog', [
    '-w',
    '-F', 'xml',
    '-d', logDir,
  ]);
}
