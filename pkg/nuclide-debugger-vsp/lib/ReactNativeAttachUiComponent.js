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

import type {
  CommonPropsType,
  CommonStateType,
} from './ReactNativeCommonUiComponent';

import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import {getDebuggerService} from 'nuclide-commons-atom/debugger';
import ReactNativeCommonUiComponent from './ReactNativeCommonUiComponent';
import {
  getReactNativeAttachProcessInfo,
  REACT_NATIVE_PACKAGER_DEFAULT_PORT,
} from './utils';

export default class ReactNativeAttachUiComponent extends ReactNativeCommonUiComponent<
  CommonStateType,
> {
  constructor(props: CommonPropsType) {
    super(props);
    this.state = {
      workspacePath: '',
      outDir: '',
      port: REACT_NATIVE_PACKAGER_DEFAULT_PORT.toString(),
      sourceMaps: true,
      sourceMapPathOverrides: '',
    };
  }

  _getSerializationArgs() {
    return ['local', 'attach', 'React Native'];
  }

  deserializeState() {
    deserializeDebuggerConfig(
      ...this._getSerializationArgs(),
      (transientSettings, savedSettings) => {
        this.setState({
          workspacePath: savedSettings.workspacePath || '',
          outDir: savedSettings.outDir || '',
          port:
            savedSettings.port || REACT_NATIVE_PACKAGER_DEFAULT_PORT.toString(),
          sourceMaps: savedSettings.sourceMaps || true,
          sourceMapPathOverrides: savedSettings.sourceMapPathOverrides || '',
        });
      },
    );
  }

  handleLaunchClick = async (): Promise<void> => {
    const launchInfo = await getReactNativeAttachProcessInfo(
      this.stateToArgs(),
    );

    const debuggerService = await getDebuggerService();
    debuggerService.startDebugging(launchInfo);

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      workspacePath: this.state.workspacePath,
      outDir: this.state.outDir,
      port: this.state.port,
      sourceMaps: this.state.sourceMaps,
      sourceMapPathOverrides: this.state.sourceMapPathOverrides,
    });
  };
}
