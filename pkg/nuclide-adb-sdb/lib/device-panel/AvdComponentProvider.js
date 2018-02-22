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
import type {Expected} from '../../../commons-node/expected';
import type {
  DeviceTypeOrderedComponent,
  DeviceTypeComponentProvider,
} from '../../../nuclide-device-panel/lib/types';

import {View} from 'nuclide-commons-ui/View';
import nuclideUri from 'nuclide-commons/nuclideUri';
import * as React from 'react';
import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import {Expect} from '../../../commons-node/expected';
import invariant from 'assert';
import fsPromise from 'nuclide-commons/fsPromise';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import os from 'os';
import {Observable, Subject} from 'rxjs';
import {runCommand} from 'nuclide-commons/process';
import AvdTable from './ui/AvdTable';
import AvdTableHeader from './ui/AvdTableHeader';

export type Avd = {
  name: string,
  running: boolean,
  pid?: number,
};

const AVD_LOCKFILE = 'hardware-qemu.ini.lock';

export class AvdComponentProvider implements DeviceTypeComponentProvider {
  _refresh: Subject<void> = new Subject();
  _emulator: ?string;

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
    // TODO (T26257016): Don't hide the table when ADB tunneling is on.
    if (nuclideUri.isRemote(host)) {
      callback(null);
      return new UniversalDisposable();
    }

    const headerElement = (
      <View
        item={renderReactRoot(
          <AvdTableHeader refreshAvds={this._refreshAvds} />,
        )}
      />
    );
    const getProps = this._getAvds().map(avds => {
      return {
        avds,
        headerElement,
        startAvd: this._startAvd,
      };
    });
    const props = getProps.concat(this._refresh.exhaustMap(_ => getProps));
    callback({
      order: 0,
      component: bindObservableAsProps(props, AvdTable),
    });
    return new UniversalDisposable();
  }

  _getEmulator(): Observable<?string> {
    return Observable.defer(async () => {
      const androidHome = process.env.ANDROID_HOME;
      const emulator =
        androidHome != null ? `${androidHome}/tools/emulator` : null;
      if (emulator == null) {
        return null;
      }
      const exists = await fsPromise.exists(emulator);
      this._emulator = exists ? emulator : null;
      return this._emulator;
    });
  }

  _parseAvds(emulatorOutput: string): Array<string> {
    const trimmedOutput = emulatorOutput.trim();
    return trimmedOutput === '' ? [] : trimmedOutput.split(os.EOL);
  }

  async _populateAvdPID(avdName: string): Promise<Avd> {
    const lockFile = `${os.homedir()}/.android/avd/${avdName}.avd/${AVD_LOCKFILE}`;
    if (await fsPromise.exists(lockFile)) {
      const pid = parseInt(await fsPromise.readFile(lockFile, 'utf8'), 10);
      return {
        name: avdName,
        running: true,
        pid,
      };
    } else {
      return {
        name: avdName,
        running: false,
      };
    }
  }

  _populateAvdPIDs = (avds: Array<string>): Observable<Array<Avd>> => {
    return Observable.fromPromise(Promise.all(avds.map(this._populateAvdPID)));
  };

  _getAvds(): Observable<Expected<Array<Avd>>> {
    return this._getEmulator().switchMap(emulator => {
      return emulator != null
        ? runCommand(emulator, ['-list-avds'])
            .map(this._parseAvds)
            .switchMap(this._populateAvdPIDs)
            .map(Expect.value)
        : Observable.of(
            Expect.error(new Error("Cannot find 'emulator' command.")),
          );
    });
  }

  _refreshAvds = (): void => {
    this._refresh.next();
  };

  _startAvd = (avd: Avd): void => {
    invariant(this._emulator != null);
    runCommand(this._emulator, ['@' + avd.name]).subscribe(
      stdout => {},
      err => {
        atom.notifications.addError(
          `Failed to start up emulator ${avd.name}.`,
          {
            detail: err,
            dismissable: true,
          },
        );
      },
    );
  };
}
