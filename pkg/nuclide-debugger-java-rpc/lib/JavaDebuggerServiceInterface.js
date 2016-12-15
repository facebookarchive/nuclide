/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {ConnectableObservable} from 'rxjs';

export type JavaLaunchTargetInfo = {
  commandLine: string,
  classPath: string,
};

export class JavaDebuggerService {
  constructor() {
  }

  getOutputWindowObservable(): ConnectableObservable<string> {
    throw new Error('Not implemented');
  }

  getServerMessageObservable(): ConnectableObservable<string> {
    throw new Error('Not implemented');
  }

  launch(launchInfo: JavaLaunchTargetInfo): ConnectableObservable<void> {
    throw new Error('Not implemented');
  }

  sendCommand(message: string): Promise<void> {
    throw new Error('Not implemented');
  }

  dispose(): Promise<void> {
    throw new Error('Not implemented');
  }
}
