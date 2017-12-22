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
import PrepackScriptLaunchUiComponent from './PrepackLaunchUIComponent';
import invariant from 'assert';

import type {DebuggerConfigAction} from 'nuclide-debugger-common';

export default class PrepackLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  constructor(targetUri: string) {
    super('Prepack', targetUri);
  }

  getCallbacksForAction(action: DebuggerConfigAction) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: async () => {
        return action === 'launch';
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
            <PrepackScriptLaunchUiComponent
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
