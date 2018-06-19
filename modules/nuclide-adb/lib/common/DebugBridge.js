/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {LegacyProcessMessage} from 'nuclide-commons/process';
import type {DebugBridgeConfig, DeviceId} from '../types';

import {Observable} from 'rxjs';
import {observeProcess, runCommand} from 'nuclide-commons/process';

const ADB_TIMEOUT = 5000; // 5s

export type getDevicesOptions = {
  port?: number,
};

export class DebugBridge {
  static configObs: Observable<DebugBridgeConfig>;

  _serial: string;

  constructor(serial: string) {
    this._serial = serial;
  }

  getDeviceArchitecture(): Observable<string> {
    throw new Error(
      'Base class DebugBridge.getDeviceArchitecture called (abstract method)',
    );
  }

  getAPIVersion(): Observable<string> {
    throw new Error(
      'Base class DebugBridge.getAPIVersion called (abstract method)',
    );
  }

  getDeviceModel(): Observable<string> {
    throw new Error(
      'Base class DebugBridge.getDeviceModel called (abstract method)',
    );
  }

  runShortCommand(...command: string[]): Observable<string> {
    return this.constructor.configObs.switchMap(config =>
      runCommand(config.path, this.getDeviceArgs().concat(command)),
    );
  }

  runLongCommand(...command: string[]): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this.constructor.configObs.switchMap(config =>
      observeProcess(config.path, this.getDeviceArgs().concat(command), {
        killTreeWhenDone: true,
        /* TODO(T17353599) */ isExitError: () => false,
      }).catch(error => Observable.of({kind: 'error', error})),
    ); // TODO(T17463635)
  }

  getDeviceArgs(): Array<string> {
    throw new Error('Needs to be implemented by subclass!');
  }

  static _parseDevicesCommandOutput(
    stdout: string,
    port: number,
  ): Array<DeviceId> {
    return stdout
      .split(/\n+/g)
      .slice(1)
      .filter(s => s.length > 0 && !s.trim().startsWith('*'))
      .map(s => s.split(/\s+/g))
      .filter(a => a[0] !== '')
      .map(a => ({
        name: a[0],
        port,
      }));
  }

  static getDevices(options?: getDevicesOptions): Observable<Array<DeviceId>> {
    const {port: optionPort} = options || {};
    return this.configObs.switchMap(config => {
      const ports = optionPort != null ? [optionPort] : config.ports;
      const commandObs =
        ports.length > 0
          ? Observable.concat(
              ...ports.map(port =>
                runCommand(config.path, ['-P', String(port), 'devices']).map(
                  stdout => this._parseDevicesCommandOutput(stdout, port),
                ),
              ),
            )
          : Observable.concat(
              runCommand(config.path, ['devices']).map(stdout =>
                this._parseDevicesCommandOutput(stdout, -1),
              ),
            );
      return commandObs
        .toArray()
        .switchMap(deviceList =>
          Observable.of(
            deviceList.reduce((a, b) => (a != null ? a.concat(...b) : b)),
          ),
        )
        .timeout(ADB_TIMEOUT);
    });
  }

  static killServer(): Promise<void> {
    return this.configObs
      .switchMap(config => runCommand(config.path, ['kill-server']))
      .mapTo(undefined)
      .toPromise();
  }

  static getVersion(): Promise<string> {
    return this.configObs
      .switchMap(config => runCommand(config.path, ['version']))
      .map(versionString => {
        const version = versionString.match(/version (\d+.\d+.\d+)/);
        if (version) {
          return version[1];
        }
        throw new Error(`No version found with "${versionString}"`);
      })
      .toPromise();
  }
}
