'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import {DebuggerProcessInfo} from '../../nuclide-debugger-base';
import {PhpDebuggerInstance} from './PhpDebuggerInstance';

import type {NuclideUri} from '../../commons-node/nuclideUri';
import nuclideUri from '../../commons-node/nuclideUri';

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

  compareDetails(other: DebuggerProcessInfo): number {
    invariant(other instanceof AttachProcessInfo);
    return compareString(this._targetUri, other._targetUri);
  }

  displayString(): string {
    return nuclideUri.getHostname(this._targetUri);
  }

  supportSingleThreadStepping(): boolean {
    return true;
  }
}

function compareString(value1: string, value2: string): number {
  return value1 === value2 ? 0 : (value1 < value2 ? -1 : 1);
}
