'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {DebuggerProcessInfo} from '../../nuclide-debugger-atom';
import {HhvmDebuggerInstance} from './HhvmDebuggerInstance';

import type {NuclideUri} from '../../nuclide-remote-uri';

export class LaunchProcessInfo extends DebuggerProcessInfo {
  _launchTarget: string;

  constructor(targetUri: NuclideUri, launchTarget: string) {
    super('hhvm', targetUri);
    this._launchTarget = launchTarget;
  }

  async debug(): Promise<HhvmDebuggerInstance> {
    return new HhvmDebuggerInstance(this, this._launchTarget);
  }
}
