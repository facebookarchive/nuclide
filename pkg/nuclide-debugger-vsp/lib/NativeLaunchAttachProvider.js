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

import {DebuggerLaunchAttachProvider} from 'nuclide-debugger-common';
import * as React from 'react';
import NativeLaunchUiComponent from './NativeLaunchUiComponent';
import NativeAttachUiComponent from './NativeAttachUiComponent';
import invariant from 'assert';

import type {DebuggerConfigAction} from 'nuclide-debugger-common';

export default class NativeLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  constructor(targetUri: string) {
    super('Native (VSP)', targetUri);
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
              configIsValidChanged={configIsValidChanged}
            />
          );
        } else if (action === 'attach') {
          return (
            <NativeAttachUiComponent
              targetUri={this.getTargetUri()}
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
