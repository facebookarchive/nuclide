/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {IProcessConfig} from 'nuclide-debugger-common';
import type {
  Device,
  DeviceProcessTaskProvider,
  Process,
  ProcessTaskType,
} from 'nuclide-debugger-common/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {VsAdapterTypes} from 'nuclide-debugger-common';
import {Observable} from 'rxjs';
import {getDebuggerService} from 'nuclide-commons-atom/debugger';

async function _createAndroidDebugAttachConfig(
  targetUri: NuclideUri,
  device: Device,
  pid: number,
): Promise<IProcessConfig> {
  const config = {
    deviceAndProcess: {
      device,
      selectedProcess: {
        pid,
        name: '',
      },
    },
    adbServiceUri: targetUri,
  };
  return {
    targetUri,
    debugMode: 'attach',
    adapterType: VsAdapterTypes.JAVA_ANDROID,
    config,
    customDisposable: new UniversalDisposable(),
    processName: 'Process ' + pid + ' (Android Java ' + device.name + ')',
  };
}

export class JavaDebuggerDevicePanelProvider
  implements DeviceProcessTaskProvider {
  constructor() {}

  getType(): string {
    return 'Android';
  }

  getTaskType(): ProcessTaskType {
    return 'DEBUG';
  }

  getSupportedPIDs(
    host: NuclideUri,
    device: Device,
    procs: Process[],
  ): Observable<Set<number>> {
    return Observable.of(
      new Set(procs.filter(proc => proc.isJava).map(proc => proc.pid)),
    );
  }

  getName(): string {
    return 'Attach Java debugger';
  }

  async run(host: NuclideUri, device: Device, proc: Process): Promise<void> {
    const debuggerService = await getDebuggerService();
    const config = await _createAndroidDebugAttachConfig(
      host,
      device,
      proc.pid,
    );
    debuggerService.startVspDebugging(config);
  }
}
