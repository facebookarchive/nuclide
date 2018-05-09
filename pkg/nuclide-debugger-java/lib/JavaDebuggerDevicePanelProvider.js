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

import type {
  Device,
  DeviceProcessTaskProvider,
  Process,
  ProcessTaskType,
} from '../../nuclide-device-panel/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {NuclideJavaDebuggerProvider} from './types';

import {Observable} from 'rxjs';
import {getDebuggerService} from 'nuclide-commons-atom/debugger';

export class JavaDebuggerDevicePanelProvider
  implements DeviceProcessTaskProvider {
  _javaDebugger: NuclideJavaDebuggerProvider;

  constructor(javaDebugger: NuclideJavaDebuggerProvider) {
    this._javaDebugger = javaDebugger;
  }

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
    const {processInfo} = await this._javaDebugger.createAndroidDebugInfo({
      targetUri: host,
      packageName: '',
      device,
      pid: proc.pid,
    });
    debuggerService.startDebugging(processInfo);
  }
}
