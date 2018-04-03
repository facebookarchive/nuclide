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

import {DebuggerLaunchAttachProvider} from 'nuclide-debugger-common';
import * as React from 'react';
import {LaunchUIComponent} from './LaunchUIComponent';
import {AttachUIComponent} from './AttachUIComponent';
import {AndroidLaunchComponent} from './AndroidLaunchComponent';
import {AndroidAttachComponent} from './AndroidAttachComponent';
import invariant from 'assert';

const JAVA_DEBUG_DESKTOP = 'Java (Desktop)';
const JAVA_DEBUG_ANDROID = 'Java (Android)';

export class JavaLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  getCallbacksForAction(action: DebuggerConfigAction) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: (): Promise<boolean> => {
        return Promise.resolve(true);
      },

      /**
       * Returns a list of supported debugger types + environments for the specified action.
       */
      getDebuggerTypeNames: () => {
        return [JAVA_DEBUG_DESKTOP, JAVA_DEBUG_ANDROID];
      },

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (
        debuggerTypeName: string,
        configIsValidChanged: (valid: boolean) => void,
      ) => {
        if (action === 'launch') {
          if (debuggerTypeName === JAVA_DEBUG_ANDROID) {
            return (
              <AndroidLaunchComponent
                targetUri={this.getTargetUri()}
                configIsValidChanged={configIsValidChanged}
              />
            );
          } else if (debuggerTypeName === JAVA_DEBUG_DESKTOP) {
            return (
              <LaunchUIComponent
                targetUri={this.getTargetUri()}
                configIsValidChanged={configIsValidChanged}
              />
            );
          }
        } else if (action === 'attach') {
          if (debuggerTypeName === JAVA_DEBUG_ANDROID) {
            return (
              <AndroidAttachComponent
                targetUri={this.getTargetUri()}
                configIsValidChanged={configIsValidChanged}
              />
            );
          } else if (debuggerTypeName === JAVA_DEBUG_DESKTOP) {
            return (
              <AttachUIComponent
                targetUri={this.getTargetUri()}
                configIsValidChanged={configIsValidChanged}
              />
            );
          }
        }

        invariant(false, 'Unrecognized action for component.');
      },
    };
  }

  dispose(): void {}
}
