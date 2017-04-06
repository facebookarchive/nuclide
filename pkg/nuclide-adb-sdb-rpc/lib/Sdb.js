/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {DebugBridge} from './DebugBridge';
import invariant from 'assert';
import nuclideUri from '../../commons-node/nuclideUri';
import {Observable} from 'rxjs';

import type {ProcessMessage} from '../../commons-node/process-rpc-types';
import type {NuclideUri} from '../../commons-node/nuclideUri';

export class Sdb extends DebugBridge {
  getTizenModelConfigKey(device: string, key: string): Promise<string> {
    const modelConfigPath = '/etc/config/model-config.xml';

    return this.runShortAdbCommand(device, ['shell', 'cat', modelConfigPath])
      .map(stdout => stdout.split(/\n+/g)
                       .filter(s => s.indexOf(key) !== -1)[0])
      .map(s => {
        const regex = /.*<.*>(.*)<.*>/g;
        return regex.exec(s)[1];
      })
      .toPromise();
  }

  getDeviceArchitecture(device: string): Promise<string> {
    return this.runShortAdbCommand(device, ['shell', 'uname', '-m'])
      .map(s => s.trim()).toPromise();
  }

  getDeviceModel(device: string): Promise<string> {
    return this.getTizenModelConfigKey(device, 'tizen.org/system/model_name');
  }

  async getAPIVersion(device: string): Promise<string> {
    let version;
    try {
      version = await
        this.getTizenModelConfigKey(device, 'tizen.org/feature/platform.core.api.version');
    } catch (e) {
      version = await
        this.getTizenModelConfigKey(device, 'tizen.org/feature/platform.native.api.version');
    }
    return version;
  }

  installPackage(device: string, packagePath: NuclideUri): Observable<ProcessMessage> {
    invariant(!nuclideUri.isRemote(packagePath));
    return this.runLongAdbCommand(device, ['install', packagePath]);
  }
}
