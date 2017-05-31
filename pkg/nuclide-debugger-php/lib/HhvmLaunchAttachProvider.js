/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {DebuggerConfigAction} from '../../nuclide-debugger-base';

import {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import React from 'react';
import {LaunchUiComponent} from './LaunchUiComponent';
import {AttachUiComponent} from './AttachUiComponent';
import invariant from 'assert';

export class HhvmLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  constructor(debuggingTypeName: string, targetUri: string) {
    super(debuggingTypeName, targetUri);
  }

  isEnabled(action: DebuggerConfigAction): Promise<boolean> {
    return Promise.resolve(true);
  }

  getComponent(
    debuggerTypeName: string,
    action: DebuggerConfigAction,
    configIsValidChanged: (valid: boolean) => void,
  ): ?React.Element<any> {
    if (action === 'launch') {
      return (
        <LaunchUiComponent
          targetUri={this.getTargetUri()}
          configIsValidChanged={configIsValidChanged}
        />
      );
    } else if (action === 'attach') {
      return (
        <AttachUiComponent
          targetUri={this.getTargetUri()}
          configIsValidChanged={configIsValidChanged}
        />
      );
    } else {
      invariant(false, 'Unrecognized action for component.');
    }
  }

  dispose(): void {}
}
