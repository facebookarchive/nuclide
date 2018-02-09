/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  DebuggerCapabilities,
  DebuggerProperties,
  DebuggerInstanceInterface,
} from './types';
import type {PausedEvent} from './protocol-types';

export default class DebuggerProcessInfo {
  _serviceName: string;
  _targetUri: NuclideUri;

  constructor(serviceName: string, targetUri: NuclideUri) {
    this._serviceName = serviceName;
    this._targetUri = targetUri;
  }

  getServiceName(): string {
    return this._serviceName;
  }

  getTargetUri(): NuclideUri {
    return this._targetUri;
  }

  getDebuggerCapabilities(): DebuggerCapabilities {
    return {
      conditionalBreakpoints: false,
      continueToLocation: false,
      customSourcePaths: false,
      disassembly: false,
      readOnlyTarget: false,
      registers: false,
      setVariable: false,
      threads: false,
      completionsRequest: false,
    };
  }

  getDebuggerProps(): DebuggerProperties {
    return {
      customControlButtons: [],
      targetDescription: () => null,
      threadsComponentTitle: 'Threads',
    };
  }

  configureSourceFilePaths(): void {
    // Debuggers that support this will override this routine.
    throw new Error('Not supported');
  }

  clone(): DebuggerProcessInfo {
    throw new Error('abstract method');
  }

  shouldFilterBreak(pausedEvent: PausedEvent): boolean {
    // Gives an individual debugger front-end the option to auto-resume
    // from a break if it should be filtered so that the user doesn't see it.
    return false;
  }

  async debug(): Promise<DebuggerInstanceInterface> {
    throw new Error('abstract method');
  }

  dispose(): void {}
}
