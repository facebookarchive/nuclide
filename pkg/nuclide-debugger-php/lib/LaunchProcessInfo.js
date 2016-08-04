'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {DebuggerProcessInfo} from '../../nuclide-debugger-base';
import {PhpDebuggerInstance} from './PhpDebuggerInstance';

import type {NuclideUri} from '../../commons-node/nuclideUri';

export class LaunchProcessInfo extends DebuggerProcessInfo {
  _launchTarget: string;

  constructor(targetUri: NuclideUri, launchTarget: string) {
    super('hhvm', targetUri);
    this._launchTarget = launchTarget;
  }

  async debug(): Promise<PhpDebuggerInstance> {
    return new PhpDebuggerInstance(this, this._launchTarget);
  }

  supportSingleThreadStepping(): boolean {
    return true;
  }

  singleThreadSteppingEnabled(): boolean {
    return true;
  }

}
