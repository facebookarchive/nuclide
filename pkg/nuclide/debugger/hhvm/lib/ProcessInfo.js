'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type{
  nuclide_debugger$DebuggerInstance,
  nuclide_debugger$DebuggerProcessInfo,
} from '../../interfaces/service';

import invariant from 'assert';

const {DebuggerProcessInfo} = require('../../utils');
class ProcessInfo extends DebuggerProcessInfo
{
  _remoteDirectoryPath: string;

  constructor(remoteDirectoryPath: string) {
    super('hhvm');

    this._remoteDirectoryPath = remoteDirectoryPath;
  }

  attach(): nuclide_debugger$DebuggerInstance {
    const DebuggerProcess = require('./DebuggerProcess');
    return new DebuggerProcess(this._remoteDirectoryPath);
  }

  launch(launchTarget: string) {
    const DebuggerProcess = require('./DebuggerProcess');
    return new DebuggerProcess(this._remoteDirectoryPath, launchTarget);
  }

  compareDetails(other: nuclide_debugger$DebuggerProcessInfo): number {
    invariant(other instanceof ProcessInfo);
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

module.exports = ProcessInfo;
