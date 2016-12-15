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
import type {JavaLaunchTargetInfo} from './JavaDebuggerServiceInterface';

import {DebuggerRpcWebSocketService} from '../../nuclide-debugger-common';
import {Observable} from 'rxjs';


export class JavaDebuggerService extends DebuggerRpcWebSocketService {
  constructor() {
    super('java');
  }

  launch(launchInfo: JavaLaunchTargetInfo): ConnectableObservable<void> {
    return Observable.fromPromise(this._startDebugging(launchInfo)).publish();
  }

  async _startDebugging(launchInfo: JavaLaunchTargetInfo): Promise<void> {
    // TODO
  }
}
