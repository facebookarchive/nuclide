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

import typeof * as AdbService
  from '../../../nuclide-adb-sdb-rpc/lib/AdbService';
import typeof * as SdbService
  from '../../../nuclide-adb-sdb-rpc/lib/SdbService';
import type {DeviceTypeTaskProvider} from '../../../nuclide-devices/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {TaskEvent} from 'nuclide-commons/process';

import showModal from '../../../nuclide-ui/showModal';
import {ATCustomDBPathModal} from './ui/ATCustomDBPathModal';
import {Observable} from 'rxjs';
import React from 'react';

export class ATConfigurePathTaskProvider implements DeviceTypeTaskProvider {
  _type: string;
  _rpcFactory: (host: NuclideUri) => AdbService | SdbService;
  _dbType: 'adb' | 'sdb';

  constructor(
    type: string,
    rpcFactory: (host: NuclideUri) => AdbService | SdbService,
  ) {
    this._type = type;
    this._rpcFactory = rpcFactory;
    this._dbType = this._type === 'android' ? 'adb' : 'sdb';
  }

  getType(): string {
    return this._type;
  }

  getName(): string {
    return `Set custom ${this._dbType} path`;
  }

  getTask(host: NuclideUri): Observable<TaskEvent> {
    return Observable.create(observer => {
      const disposable = showModal(
        dismiss => (
          <ATCustomDBPathModal
            dismiss={dismiss}
            currentActivePath="test"
            currentCustomPath={null}
            registeredPaths={['uno', 'dos', 'tres']}
            setCustomPath={() => {}}
            type={this._dbType}
          />
        ),
        {
          className: 'nuclide-adb-sdb-custom-path-modal',
          onDismiss: () => {
            disposable.dispose();
            observer.complete();
          },
          disableDismissOnClickOutsideModal: true,
        },
      );
    });
  }
}
