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

export class HhvmDebuggerProcessInfo extends DebuggerProcessInfo {
  _remoteDirectoryPath: string;

  constructor(remoteDirectoryPath: string) {
    super('hhvm');

    this._remoteDirectoryPath = remoteDirectoryPath;
  }

  attach(): HhvmDebuggerInstance {
    return new HhvmDebuggerInstance(this._remoteDirectoryPath);
  }

  launch(launchTarget: string): HhvmDebuggerInstance {
    return new HhvmDebuggerInstance(this._remoteDirectoryPath, launchTarget);
  }

  compareDetails(other: DebuggerProcessInfo): number {
    invariant(other instanceof HhvmDebuggerProcessInfo);
    return compareString(this._remoteDirectoryPath, other._remoteDirectoryPath);
  }

  displayString(): string {
    const remoteUri = require('../../../remote-uri');
    return remoteUri.getHostname(this._remoteDirectoryPath);
  }
}

function compareString(value1: string, value2: string): number {
  return value1 === value2 ? 0 : (value1 < value2 ? -1 : 1);
}
