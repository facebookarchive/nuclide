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

import type {DebuggerConfigAction} from 'nuclide-debugger-common';
import type {Option} from 'nuclide-commons-ui/Dropdown';
import type {VsAdapterType} from 'nuclide-debugger-common';

import {VsAdapterTypes} from 'nuclide-debugger-common';
import {DebuggerLaunchAttachProvider} from 'nuclide-debugger-common';
import * as React from 'react';
import NativeLaunchUiComponent from './NativeLaunchUiComponent';
import NativeAttachUiComponent from './NativeAttachUiComponent';
import invariant from 'assert';

export default class NativeLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  _debuggerBackends: Array<Option>;
  _defaultDebuggerBackend: VsAdapterType;

  constructor(targetUri: string) {
    super('Native (VSP)', targetUri);

    this._debuggerBackends = [
      {value: VsAdapterTypes.NATIVE_GDB, label: 'gdb'},
      {value: VsAdapterTypes.NATIVE_LLDB, label: 'lldb'},
    ];

    this._defaultDebuggerBackend = VsAdapterTypes.NATIVE_LLDB;
  }

  getCallbacksForAction(action: DebuggerConfigAction) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: async () => {
        return true;
      },

      /**
       * Returns a list of supported debugger types + environments for the specified action.
       */
      getDebuggerTypeNames: super.getCallbacksForAction(action)
        .getDebuggerTypeNames,

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (
        debuggerTypeName: string,
        configIsValidChanged: (valid: boolean) => void,
      ) => {
        if (action === 'launch') {
          return (
            <NativeLaunchUiComponent
              targetUri={this.getTargetUri()}
              debuggerBackends={this._debuggerBackends}
              defaultDebuggerBackend={this._defaultDebuggerBackend}
              configIsValidChanged={configIsValidChanged}
            />
          );
        } else if (action === 'attach') {
          return (
            <NativeAttachUiComponent
              targetUri={this.getTargetUri()}
              debuggerBackends={this._debuggerBackends}
              defaultDebuggerBackend={this._defaultDebuggerBackend}
              configIsValidChanged={configIsValidChanged}
            />
          );
        } else {
          invariant(false, 'Unrecognized action for component.');
        }
      },
    };
  }

  dispose(): void {}
}
