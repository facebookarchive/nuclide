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
import type {callbacksForAction} from '../../nuclide-debugger-base/lib/DebuggerLaunchAttachProvider';

import {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import React from 'react';
import {OCamlLaunchUIComponent} from './OCamlLaunchUIComponent';

export class OcamlLaunchProvider extends DebuggerLaunchAttachProvider {
  constructor(targetUri: string) {
    super('OCaml', targetUri);
  }

  getCallbacksForAction(action: DebuggerConfigAction): callbacksForAction {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: () => {
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
        if (action === 'attach') {
          return null;
        }
        return (
          <OCamlLaunchUIComponent
            targetUri={this.getTargetUri()}
            configIsValidChanged={configIsValidChanged}
          />
        );
      },
    };
  }

  dispose() {}
}
