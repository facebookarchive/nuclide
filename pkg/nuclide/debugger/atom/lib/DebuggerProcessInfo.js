'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// TODO(jeffreytan): This is duplicated what we have in
// fbobjc/Tools/Nuclide/pkg/nuclide/debugger-utils/lib/main.js.
// It seems like once we move everything over to Tools/Nuclide,
// the nuclide-debugger-utils package can go away because then
// nuclide-debugger-lldb can depend on this nuclide-debugger package directly.

import type {nuclide_debugger$DebuggerInstance} from 'nuclide-debugger-interfaces/service';

class DebuggerProcessInfo {
  _serviceName: string;

  constructor(serviceName: string) {
    this._serviceName = serviceName;
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

  compareDetails(other:DebuggerProcessInfo): number {
    throw new Error('abstract method');
  }

  attach(): nuclide_debugger$DebuggerInstance {
    throw new Error('abstract method');
  }

  launch(launchTarget: string): nuclide_debugger$DebuggerInstance {
    throw new Error('abstract method');
  }

  // For debugLLDB().
  pid: ?number;
  basepath: ?string;
}

module.exports = DebuggerProcessInfo;
