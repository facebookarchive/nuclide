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

import {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import * as React from 'react';
import PythonScriptLaunchUiComponent from './PythonScriptLaunchUiComponent';
import invariant from 'assert';

import type {DebuggerConfigAction} from 'nuclide-debugger-common';

export default class PythonLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  constructor(targetUri: string) {
    super('Python', targetUri);
  }

  getCallbacksForAction(action: DebuggerConfigAction) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: (): Promise<boolean> => {
        return Promise.resolve(action === 'launch');
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
            <PythonScriptLaunchUiComponent
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
