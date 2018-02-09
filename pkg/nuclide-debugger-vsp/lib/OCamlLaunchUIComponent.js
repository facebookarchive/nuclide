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

import React from 'react';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import {Checkbox} from 'nuclide-commons-ui/Checkbox';
import {shellParse} from 'nuclide-commons/string';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Logger} from 'vscode-debugadapter';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import {getDebuggerService} from '../../commons-atom/debugger';
import {getOCamlLaunchProcessInfo} from './utils';

type PropsType = {
  targetUri: NuclideUri,
  configIsValidChanged: (valid: boolean) => void,
};

type StateType = {
  ocamldebugExecutable: string,
  launchExecutable: string,
  launchArguments: string,
  environmentVariables: string,
  workingDirectory: string,
  additionalIncludeDirectories: string,
  breakAfterStart: boolean,
};
export class OCamlLaunchUIComponent extends React.Component<
  PropsType,
  StateType,
> {
  props: PropsType;
  state: StateType;
  _disposables: UniversalDisposable;

  constructor(props: PropsType) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      ocamldebugExecutable: '',
      launchExecutable: '',
      launchArguments: '',
      environmentVariables: '',
      workingDirectory: '',
      additionalIncludeDirectories: '',
      breakAfterStart: false,
    };
    (this: any)._handleLaunchClick = this._handleLaunchClick.bind(this);
  }

  _getSerializationArgs() {
    return [
      nuclideUri.isRemote(this.props.targetUri)
        ? nuclideUri.getHostname(this.props.targetUri)
        : 'local',
      'launch',
      'OCaml',
    ];
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(state: Object) {
    super.setState(state);
    // const canLaunch = this.state.launchExecutable.trim().length > 0;
    // this.props.configIsValidChanged(canLaunch);
    this.props.configIsValidChanged(true);
  }

  componentDidMount(): void {
    deserializeDebuggerConfig(
      ...this._getSerializationArgs(),
      (transientSettings, savedSettings) => {
        this.setState({
          ocamldebugExecutable: savedSettings.ocamldebugExecutable || '',
          launchExecutable: savedSettings.launchExecutable || '',
          launchArguments: savedSettings.launchArguments || '',
          environmentVariables: savedSettings.environmentVariables || '',
          workingDirectory: savedSettings.workingDirectory || '',
          additionalIncludeDirectories:
            savedSettings.additionalIncludeDirectories || '',
          breakAfterStart: savedSettings.breakAfterStart || false,
        });
      },
    );
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': () => {
          this._handleLaunchClick();
        },
      }),
    );
  }

  render() {
    return (
      <div className="block">
        <label>Ocamldebug executable: </label>
        <AtomInput
          tabIndex="11"
          placeholderText="Path to ocamldebug"
          value={this.state.ocamldebugExecutable}
          onDidChange={value => this.setState({ocamldebugExecutable: value})}
        />
        <label>Executable: </label>
        <AtomInput
          tabIndex="12"
          placeholderText="Input the executable path you want to launch"
          value={this.state.launchExecutable}
          onDidChange={value => this.setState({launchExecutable: value})}
        />
        <label>Arguments: </label>
        <AtomInput
          tabIndex="13"
          placeholderText="Arguments to the executable"
          value={this.state.launchArguments}
          onDidChange={value => this.setState({launchArguments: value})}
        />
        <label>Environment Variables: </label>
        <AtomInput
          tabIndex="14"
          placeholderText="Environment variables (e.g., SHELL=/bin/bash PATH=/bin)"
          value={this.state.environmentVariables}
          onDidChange={value => this.setState({environmentVariables: value})}
        />
        <label>Working directory: </label>
        <AtomInput
          tabIndex="15"
          placeholderText="Working directory for the launched executable"
          value={this.state.workingDirectory}
          onDidChange={value => this.setState({workingDirectory: value})}
        />
        <label>Additional include directories: </label>
        <AtomInput
          tabIndex="16"
          placeholderText="Additional include directories that debugger will use to search for source code"
          value={this.state.additionalIncludeDirectories}
          onDidChange={value =>
            this.setState({additionalIncludeDirectories: value})
          }
        />
        <label>Break after start: </label>
        <Checkbox
          tabIndex="16"
          checked={this.state.breakAfterStart}
          onChange={value => this.setState({breakAfterStart: value})}
        />
      </div>
    );
  }

  async _handleLaunchClick(): Promise<void> {
    // TODO: perform some validation for the input.
    const launchExecutable = this._expandIfLocal(
      this.state.launchExecutable.trim(),
    );
    const ocamldebugExecutable = this._expandIfLocal(
      this.state.ocamldebugExecutable.trim(),
    );
    const launchArguments = shellParse(this.state.launchArguments);
    const launchEnvironmentVariables = shellParse(
      this.state.environmentVariables,
    );
    const launchWorkingDirectory = this._expandIfLocal(
      this.state.workingDirectory.trim(),
    );
    const additionalIncludeDirectories = shellParse(
      this.state.additionalIncludeDirectories,
    );
    const launchTarget = {
      ocamldebugExecutable,
      executablePath: launchExecutable,
      arguments: launchArguments,
      environmentVariables: launchEnvironmentVariables,
      workingDirectory: launchWorkingDirectory,
      includeDirectories: additionalIncludeDirectories,
      breakAfterStart: this.state.breakAfterStart,
      targetUri: this.props.targetUri,
      logLevel: Logger.LogLevel.Verbose, // TODO: read from configuration
    };

    const debuggerService = await getDebuggerService();
    const launchProcessInfo = await getOCamlLaunchProcessInfo(
      this.props.targetUri,
      launchTarget,
    );
    debuggerService.startDebugging(launchProcessInfo);
    serializeDebuggerConfig(...this._getSerializationArgs(), this.state);
  }

  _expandIfLocal(path: NuclideUri): NuclideUri {
    if (nuclideUri.isRemote(this.props.targetUri)) {
      // TODO: support expansion for remote paths.
      return path;
    }

    return nuclideUri.expandHomeDir(path);
  }
}
