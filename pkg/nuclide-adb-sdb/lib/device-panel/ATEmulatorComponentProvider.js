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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  Device,
  DeviceTypeOrderedComponent,
  DeviceTypeComponentProvider,
} from '../../../nuclide-device-panel/lib/types';

import invariant from 'assert';
import fsPromise from 'nuclide-commons/fsPromise';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import os from 'os';
import {Observable} from 'rxjs';
import {runCommand} from 'nuclide-commons/process';
import ATEmulatorTable from './ui/ATEmulatorTable';

export type Avd = string;

export class ATEmulatorComponentProvider
  implements DeviceTypeComponentProvider {
  _avds: Device[];
  _emulator: ?string;

  constructor(state: ?mixed) {
    this._avds = [];
  }

  getType(): string {
    return 'Android';
  }

  getName(): string {
    return 'Emulators';
  }

  observe(
    host: NuclideUri,
    callback: (?DeviceTypeOrderedComponent) => void,
  ): IDisposable {
    this._getEmulator()
      .then(emulator => {
        this._emulator = emulator;
        return emulator == null
          ? Promise.reject(new Error('No `emulator` found'))
          : this._getAvds();
      })
      .then(avds => {
        callback({
          order: 0,
          component: bindObservableAsProps(
            Observable.of({avds, startAvd: this._startAvd.bind(this)}),
            ATEmulatorTable,
          ),
        });
      })
      .catch(error => {});
    return new UniversalDisposable();
  }

  _getEmulator(): Promise<?string> {
    const androidHome = process.env.ANDROID_HOME;
    const emulator =
      androidHome != null ? `${androidHome}/tools/emulator` : null;
    if (emulator == null) {
      return Promise.resolve(null);
    }
    return fsPromise.exists(emulator).then(exists => {
      return exists ? Promise.resolve(emulator) : Promise.resolve(null);
    });
  }

  _parseAvds(emulatorOutput: string): Avd[] {
    return emulatorOutput.trim().split(os.EOL);
  }

  _getAvds(): Promise<Avd[]> {
    invariant(this._emulator != null);
    return runCommand(this._emulator, ['-list-avds'])
      .map(this._parseAvds)
      .toPromise();
  }

  _startAvd(avd: Avd): void {
    invariant(this._emulator != null);
    runCommand(this._emulator, ['@' + avd]).subscribe(
      stdout => {},
      err => {
        atom.notifications.addError(
          `Failed to start up emulator ${avd}. Perhaps it's already running?`,
          {
            detail: err,
            dismissable: true,
          },
        );
      },
    );
  }
}
