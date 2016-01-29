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
import {DebuggerProcessInfo} from '../../atom';
import {HhvmDebuggerInstance} from './HhvmDebuggerInstance';

import type {NuclideUri} from '../../../remote-uri';

export class HhvmDebuggerProcessInfo extends DebuggerProcessInfo {
  constructor(targetUri: NuclideUri) {
    super('hhvm', targetUri);
  }

  attach(): HhvmDebuggerInstance {
    return new HhvmDebuggerInstance(this);
  }

  launch(launchTarget: string): HhvmDebuggerInstance {
    return new HhvmDebuggerInstance(this, launchTarget);
  }

  compareDetails(other: DebuggerProcessInfo): number {
    invariant(other instanceof HhvmDebuggerProcessInfo);
    return compareString(this._targetUri, other._targetUri);
  }

  displayString(): string {
    const remoteUri = require('../../../remote-uri');
    return remoteUri.getHostname(this._targetUri);
  }
}

function compareString(value1: string, value2: string): number {
  return value1 === value2 ? 0 : (value1 < value2 ? -1 : 1);
}
