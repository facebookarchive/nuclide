/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {DebugBridgeConfig} from './types';
import type {LegacyProcessMessage} from 'nuclide-commons/process';

import {observeProcess, runCommand} from 'nuclide-commons/process';
import {Observable} from 'rxjs';

export class DebugBridge {
  _configObs: Observable<DebugBridgeConfig>;

  constructor(configObs: Observable<DebugBridgeConfig>) {
    this._configObs = configObs;
  }

  _getDeviceArg(device: string): string[] {
    return device !== '' ? ['-s', device] : [];
  }

  runShortCommand(device: string, command: Array<string>): Observable<string> {
    return this._configObs.switchMap(config =>
      runCommand(config.path, this._getDeviceArg(device).concat(command)),
    );
  }

  runLongCommand(
    device: string,
    command: string[],
  ): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this._configObs.switchMap(config =>
      observeProcess(config.path, this._getDeviceArg(device).concat(command), {
        killTreeWhenDone: true,
        /* TODO(T17353599) */ isExitError: () => false,
      }).catch(error => Observable.of({kind: 'error', error})),
    ); // TODO(T17463635)
  }

  getDevices(): Observable<Array<string>> {
    return this._configObs.switchMap(config =>
      runCommand(config.path, ['devices']).map(stdout =>
        stdout
          .split(/\n+/g)
          .slice(1)
          .filter(s => s.length > 0 && !s.trim().startsWith('*'))
          .map(s => s.split(/\s+/g))
          .filter(a => a[0] !== '')
          .map(a => a[0]),
      ),
    );
  }
}
