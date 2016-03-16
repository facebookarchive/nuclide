'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DebuggerInstance from './DebuggerInstance';
import type {NuclideUri} from '../../nuclide-remote-uri';

class DebuggerProcessInfo {
  _serviceName: string;
  _targetUri: NuclideUri;

  constructor(serviceName: string, targetUri: NuclideUri) {
    this._serviceName = serviceName;
    this._targetUri = targetUri;
  }

  toString(): string {
    return this._serviceName + ' : ' + this.displayString();
  }

  displayString(): string {
    throw new Error('abstract method');
  }

  getServiceName(): string {
    return this._serviceName;
  }

  getTargetUri(): NuclideUri {
    return this._targetUri;
  }

  compareDetails(other: DebuggerProcessInfo): number {
    throw new Error('abstract method');
  }

  async debug(): Promise<DebuggerInstance> {
    throw new Error('abstract method');
  }

  // For debugLLDB().
  pid: number;
  basepath: ?string;
}

module.exports = DebuggerProcessInfo;
