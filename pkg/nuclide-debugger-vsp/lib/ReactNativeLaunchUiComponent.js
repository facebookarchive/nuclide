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
  CommonStateType,
  CommonPropsType,
} from './ReactNativeCommonUiComponent';
import type {ReactNativeLaunchArgs} from './types';

import RadioGroup from 'nuclide-commons-ui/RadioGroup';

import * as React from 'react';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import {getDebuggerService} from 'nuclide-commons-atom/debugger';
import {
  getReactNativeLaunchProcessInfo,
  REACT_NATIVE_PACKAGER_DEFAULT_PORT,
} from './utils';
import ReactNativeCommonUiComponent from './ReactNativeCommonUiComponent';

type Platform = 'Android' | 'iOS';
type Target = 'Device' | 'Simulator';

type StateType = CommonStateType & {
  platform: Platform,
  target: Target,
};

// Directly calling string.toLowerCase would lose the specific type.
function checkedLowerCasePlatform(platform: Platform): 'android' | 'ios' {
  switch (platform) {
    case 'Android':
      return 'android';
    case 'iOS':
      return 'ios';
    default:
      throw new Error('Unexpected platform case');
  }
}

function checkedLowerCaseTarget(target: Target): 'device' | 'simulator' {
  switch (target) {
    case 'Device':
      return 'device';
    case 'Simulator':
      return 'simulator';
    default:
      throw new Error('Unexpected target case');
  }
}

export default class ReactNativeLaunchUiComponent extends ReactNativeCommonUiComponent<
  StateType,
> {
  constructor(props: CommonPropsType) {
    super(props);
    this.state = {
      workspacePath: '',
      outDir: '',
      platform: 'Android',
      target: 'Simulator',
      port: REACT_NATIVE_PACKAGER_DEFAULT_PORT.toString(),
      sourceMaps: true,
      sourceMapPathOverrides: '',
    };
  }

  _getSerializationArgs() {
    return ['local', 'launch', 'React Native'];
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
          platform: savedSettings.platform || 'Android',
          target: savedSettings.target || 'Simulator',
        });
      },
    );
  }

  render(): React.Node {
    const platforms = ['Android', 'iOS'];
    const targets = ['Simulator', 'Device'];
    return (
      <span>
        {super.render()}
        <div className="block">
          <label>Launch platform: </label>
          <RadioGroup
            selectedIndex={platforms.indexOf(this.state.platform)}
            optionLabels={platforms}
            onSelectedChange={index =>
              this.setState({platform: platforms[index]})
            }
          />
          <label>Launch target: </label>
          <RadioGroup
            selectedIndex={targets.indexOf(this.state.target)}
            optionLabels={targets}
            onSelectedChange={index => this.setState({target: targets[index]})}
          />
        </div>
      </span>
    );
  }

  stateToArgs(): ReactNativeLaunchArgs {
    const attachArgs = super.stateToArgs();
    const platform = checkedLowerCasePlatform(this.state.platform);
    const target = checkedLowerCaseTarget(this.state.target);
    return {...attachArgs, platform, target};
  }

  handleLaunchClick = async (): Promise<void> => {
    const launchInfo = await getReactNativeLaunchProcessInfo(
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
      platform: this.state.platform,
      target: this.state.target,
    });
  };
}
