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

import {shellParse} from 'nuclide-commons/string';

import type {LaunchAttachStore} from './LaunchAttachStore';
import type {LaunchAttachActions} from './LaunchAttachActions';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {LaunchTargetInfo} from '../../nuclide-debugger-native-rpc/lib/NativeDebuggerServiceInterface';
import * as React from 'react';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import nullthrows from 'nullthrows';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import classnames from 'classnames';

type PropsType = {
  targetUri: NuclideUri,
  // TODO Remove disable
  // eslint-disable-next-line react/no-unused-prop-types
  store: LaunchAttachStore,
  actions: LaunchAttachActions,
  configIsValidChanged: (valid: boolean) => void,
};

type StateType = {
  launchExecutable: string,
  launchArguments: string,
  launchEnvironmentVariables: string,
  launchWorkingDirectory: string,
  stdinFilePath: string,
  coreDump: string,
  launchSourcePath: string,
};

export class LaunchUIComponent extends React.Component<PropsType, StateType> {
  props: PropsType;
  state: StateType;
  _disposables: UniversalDisposable;

  _coreDump: ?AtomInput;
  _launchArguments: ?AtomInput;
  _launchEnvironmentVariables: ?AtomInput;
  _launchExecutable: ?AtomInput;
  _launchSourcePath: ?AtomInput;
  _launchWorkingDirectory: ?AtomInput;
  _stdinFilePath: ?AtomInput;

  constructor(props: PropsType) {
    super(props);

    this._disposables = new UniversalDisposable();
    this.state = {
      launchExecutable: '',
      launchArguments: '',
      launchEnvironmentVariables: '',
      launchWorkingDirectory: '',
      stdinFilePath: '',
      coreDump: '',
      launchSourcePath: '',
    };
  }

  _getSerializationArgs() {
    return [
      nuclideUri.isRemote(this.props.targetUri)
        ? nuclideUri.getHostname(this.props.targetUri)
        : 'local',
      'launch',
      'native',
    ];
  }

  setState(newState: Object): void {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  _debugButtonShouldEnable(): boolean {
    return true;
  }

  componentDidMount(): void {
    deserializeDebuggerConfig(
      ...this._getSerializationArgs(),
      (transientSettings, savedSettings) => {
        this.setState({
          launchExecutable: savedSettings.launchExecutable,
          launchArguments: savedSettings.launchArguments,
          launchEnvironmentVariables: savedSettings.launchEnvironmentVariables,
          launchWorkingDirectory: savedSettings.launchWorkingDirectory,
          stdinFilePath: savedSettings.stdinFilePath,
          coreDump: savedSettings.coreDump || '',
          launchSourcePath: savedSettings.launchSourcePath || '',
        });
      },
    );

    if (this._launchExecutable != null) {
      this._launchExecutable.focus();
    }

    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': () => {
          this._handleLaunchClick();
        },
      }),
    );

    this.props.configIsValidChanged(true);
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render(): React.Node {
    // TODO: smart fill the working directory textbox.
    // TODO: make tab stop between textbox work.
    // Reserve tabIndex [1~10] to header portion of the UI so we start from "11" here.
    return (
      <div className="block">
        <label>Executable: </label>
        <AtomInput
          ref={input => {
            this._launchExecutable = input;
          }}
          tabIndex="11"
          placeholderText="Input the executable path you want to launch"
          value={this.state.launchExecutable}
          onDidChange={value => this.setState({launchExecutable: value})}
        />
        <label>Core dump file: </label>
        <AtomInput
          ref={input => {
            this._coreDump = input;
          }}
          tabIndex="12"
          placeholderText="Optional path to a core dump file to offline debug a crash"
          value={this.state.coreDump}
          onDidChange={value => this.setState({coreDump: value})}
        />
        <div className="nuclide-native-launch-small-text">
          Be sure to copy the core dump to a location where Nuclide has read
          access. (Nuclide server does not run as root).
        </div>
        <div
          className={classnames({
            'nuclide-native-launch-disabled': this.state.coreDump !== '',
          })}>
          <label>Arguments: </label>
          <AtomInput
            ref={input => {
              this._launchArguments = input;
            }}
            tabIndex="13"
            disabled={this.state.coreDump !== ''}
            placeholderText="Arguments to the executable"
            value={this.state.launchArguments}
            onDidChange={value => this.setState({launchArguments: value})}
          />
          <label>Environment Variables: </label>
          <AtomInput
            ref={input => {
              this._launchEnvironmentVariables = input;
            }}
            tabIndex="14"
            disabled={this.state.coreDump !== ''}
            placeholderText="Environment variables (e.g., SHELL=/bin/bash PATH=/bin)"
            value={this.state.launchEnvironmentVariables}
            onDidChange={value =>
              this.setState({launchEnvironmentVariables: value})
            }
          />
          <label>Working directory: </label>
          <AtomInput
            ref={input => {
              this._launchWorkingDirectory = input;
            }}
            tabIndex="15"
            disabled={this.state.coreDump !== ''}
            placeholderText="Working directory for the launched executable"
            value={this.state.launchWorkingDirectory}
            onDidChange={value =>
              this.setState({launchWorkingDirectory: value})
            }
          />
          <label>Stdin file: </label>
          <AtomInput
            ref={input => {
              this._stdinFilePath = input;
            }}
            tabIndex="16"
            disabled={this.state.coreDump !== ''}
            placeholderText="Redirect stdin to this file"
            value={this.state.stdinFilePath}
            onDidChange={value => this.setState({stdinFilePath: value})}
          />
        </div>
        <label>Source path: </label>
        <AtomInput
          ref={input => {
            this._launchSourcePath = input;
          }}
          tabIndex="17"
          placeholderText="Optional base path for sources"
          value={this.state.launchSourcePath}
          onDidChange={value => this.setState({launchSourcePath: value})}
        />
      </div>
    );
  }

  _handleLaunchClick = (): void => {
    // TODO: perform some validation for the input.
    const launchExecutable = nullthrows(this._launchExecutable)
      .getText()
      .trim();
    const coreDump = nullthrows(this._coreDump)
      .getText()
      .trim();
    const launchArguments = shellParse(
      nullthrows(this._launchArguments).getText(),
    );
    const launchEnvironmentVariables = shellParse(
      nullthrows(this._launchEnvironmentVariables).getText(),
    );
    const launchWorkingDirectory = nullthrows(this._launchWorkingDirectory)
      .getText()
      .trim();
    const launchSourcePath = nullthrows(this._launchSourcePath)
      .getText()
      .trim();
    const stdinFilePath = nullthrows(this._stdinFilePath)
      .getText()
      .trim();
    const launchTarget: LaunchTargetInfo = {
      executablePath: launchExecutable,
      arguments: launchArguments,
      environmentVariables: launchEnvironmentVariables,
      workingDirectory: launchWorkingDirectory,
      stdinFilePath,
      coreDump,
    };
    if (launchSourcePath != null) {
      launchTarget.basepath = launchSourcePath;
    }
    // Fire and forget.
    this.props.actions.launchDebugger(launchTarget);

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      launchExecutable: this.state.launchExecutable,
      launchArguments: this.state.launchArguments,
      launchEnvironmentVariables: this.state.launchEnvironmentVariables,
      launchWorkingDirectory: this.state.launchWorkingDirectory,
      stdinFilePath: this.state.stdinFilePath,
      coreDump: this.state.coreDump,
      launchSourcePath: this.state.launchSourcePath,
    });
  };
}
