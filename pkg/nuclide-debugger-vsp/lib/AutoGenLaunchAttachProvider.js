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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {DebuggerConfigAction} from 'nuclide-debugger-common';
import type {
  HandleDebugButtonClick,
  LaunchAttachProviderIsEnabled,
  AutoGenConfig,
} from './types';

import invariant from 'assert';
import {DebuggerLaunchAttachProvider} from 'nuclide-debugger-common';
import * as React from 'react';
import AutoGenLaunchAttachUiComponent from './AutoGenLaunchAttachUiComponent';

const LaunchAttachProviderDefaultIsEnabled = (
  action: DebuggerConfigAction,
  config: AutoGenConfig,
) => {
  return Promise.resolve(config[action] != null);
};

const ActionNotSupportedButtonClick = (
  targetUri: NuclideUri,
  stringValues: Map<string, string>,
  booleanValues: Map<string, boolean>,
  enumValues: Map<string, string>,
  numberValues: Map<string, number>,
) => {
  throw new Error('This method should never be called');
};

export default class AutoGenLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  _config: AutoGenConfig;
  _handleLaunchButtonClick: HandleDebugButtonClick;
  _handleAttachButtonClick: HandleDebugButtonClick;
  _isEnabled: LaunchAttachProviderIsEnabled;

  constructor(
    debuggingTypeName: string,
    targetUri: string,
    config: AutoGenConfig,
    handleLaunchButtonClick: ?HandleDebugButtonClick,
    handleAttachButtonClick: ?HandleDebugButtonClick,
    isEnabled?: LaunchAttachProviderIsEnabled = LaunchAttachProviderDefaultIsEnabled,
  ) {
    super(debuggingTypeName, targetUri);
    this._config = config;
    this._handleLaunchButtonClick =
      handleLaunchButtonClick || ActionNotSupportedButtonClick;
    this._handleAttachButtonClick =
      handleAttachButtonClick || ActionNotSupportedButtonClick;
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
            handleDebugButtonClick={
              action === 'launch'
                ? this._handleLaunchButtonClick
                : this._handleAttachButtonClick
            }
            config={launchOrAttachConfig}
            debuggerTypeName={debuggerTypeName}
          />
        );
      },
    };
  }

  dispose(): void {}
}
