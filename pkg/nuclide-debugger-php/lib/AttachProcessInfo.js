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
import type {ControlButtonSpecification} from '../../nuclide-debugger/lib/types';

export class AttachProcessInfo extends DebuggerProcessInfo {
  constructor(targetUri: NuclideUri) {
    super('hhvm', targetUri);
  }

  async debug(): Promise<PhpDebuggerInstance> {
    try {
      // $FlowFB
      const services = require('./fb/services');
      await services.warnIfNotBuilt(this.getTargetUri());
      services.startSlog();
    } catch (_) {}
    return new PhpDebuggerInstance(this);
  }

  supportThreads(): boolean {
    return true;
  }

  supportSingleThreadStepping(): boolean {
    return true;
  }

  singleThreadSteppingEnabled(): boolean {
    return true;
  }

  customControlButtons(): Array<ControlButtonSpecification> {
    return [];
  }
}
