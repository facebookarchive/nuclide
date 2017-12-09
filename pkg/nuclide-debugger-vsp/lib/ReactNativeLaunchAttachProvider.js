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

import nuclideUri from 'nuclide-commons/nuclideUri';
import {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import React from 'react';
import ReactNativeAttachUiComponent from './ReactNativeAttachUiComponent';
import ReactNativeLaunchUiComponent from './ReactNativeLaunchUiComponent';

import type {DebuggerConfigAction} from 'nuclide-debugger-common';

export default class ReactNativeLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  constructor(targetUri: string) {
    super('React Native', targetUri);
  }

  getCallbacksForAction(action: DebuggerConfigAction) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: async () => {
        return nuclideUri.isLocal(this._targetUri);
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
            <ReactNativeLaunchUiComponent
              configIsValidChanged={configIsValidChanged}
            />
          );
        } else {
          return (
            <ReactNativeAttachUiComponent
              configIsValidChanged={configIsValidChanged}
            />
          );
        }
      },
    };
  }

  dispose(): void {}
}
