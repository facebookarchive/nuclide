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

import type {DebuggerConfigAction} from './types';
import type {LaunchAttachProviderIsEnabled, AutoGenConfig} from './types';

import invariant from 'assert';
import DebuggerLaunchAttachProvider from './DebuggerLaunchAttachProvider';
import * as React from 'react';
import AutoGenLaunchAttachUiComponent from './AutoGenLaunchAttachUiComponent';

const LaunchAttachProviderDefaultIsEnabled = (
  action: DebuggerConfigAction,
  config: AutoGenConfig,
) => {
  return Promise.resolve(config[action] != null);
};

export default class AutoGenLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  _config: AutoGenConfig;
  _isEnabled: LaunchAttachProviderIsEnabled;

  constructor(
    debuggingTypeName: string,
    targetUri: string,
    config: AutoGenConfig,
    isEnabled?: LaunchAttachProviderIsEnabled = LaunchAttachProviderDefaultIsEnabled,
  ) {
    super(debuggingTypeName, targetUri);
    this._config = config;
    this._isEnabled = isEnabled;
  }

  getCallbacksForAction(action: DebuggerConfigAction) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: async (): Promise<boolean> => {
        return this._isEnabled(action, this._config);
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
        const launchOrAttachConfig = this._config[action];
        invariant(launchOrAttachConfig != null);
        return (
          <AutoGenLaunchAttachUiComponent
            targetUri={this.getTargetUri()}
            configIsValidChanged={configIsValidChanged}
            config={launchOrAttachConfig}
            debuggerTypeName={debuggerTypeName}
          />
        );
      },
    };
  }

  dispose(): void {}
}
