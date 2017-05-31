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

import type {DebuggerConfigAction} from '../../../nuclide-debugger-base';

import {DebuggerLaunchAttachProvider} from '../../../nuclide-debugger-base';
import {DebugUiComponent} from './DebugUiComponent';
import invariant from 'assert';
import React from 'react';

export class ReactNativeLaunchAttachProvider
  extends DebuggerLaunchAttachProvider {
  isEnabled(action: DebuggerConfigAction): Promise<boolean> {
    return Promise.resolve(action === 'attach');
  }

  getComponent(
    debuggerTypeName: string,
    action: DebuggerConfigAction,
    configIsValidChanged: (valid: boolean) => void,
  ): ?React.Element<any> {
    invariant(action === 'attach');
    return (
      <DebugUiComponent
        targetUri={this.getTargetUri()}
        configIsValidChanged={configIsValidChanged}
      />
    );
  }

  dispose(): void {}
}
