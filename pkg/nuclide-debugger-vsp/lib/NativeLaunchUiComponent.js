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
import type {Option} from '../../nuclide-ui/Dropdown';
import type {VsAdapterType} from 'nuclide-debugger-common';

import * as React from 'react';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import {Dropdown} from '../../nuclide-ui/Dropdown';
import nuclideUri from 'nuclide-commons/nuclideUri';
import nullthrows from 'nullthrows';
import {shellParse} from 'nuclide-commons/string';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import {track} from '../../nuclide-analytics';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {getDebuggerService} from '../../commons-atom/debugger';
import {getNativeVSPLaunchProcessInfo} from './utils';

type Props = {|
  +targetUri: NuclideUri,
  +configIsValidChanged: (valid: boolean) => void,
  +debuggerBackends: Array<Option>,
  +defaultDebuggerBackend: VsAdapterType,
|};

type State = {
  program: string,
  args: string,
  workingDirectory: string,
  environmentVariables: string,
  sourcePath: string,
  debuggerBackend: VsAdapterType,
};

export default class NativeLaunchUiComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;

  _program: ?AtomInput;
  _args: ?AtomInput;
  _workingDirectory: ?AtomInput;
  _environmentVariables: ?AtomInput;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      program: '',
      args: '',
      workingDirectory: '',
      environmentVariables: '',
      sourcePath: '',
      debuggerBackend: props.defaultDebuggerBackend,
    };
  }

  _getSerializationArgs() {
    return [
      nuclideUri.isRemote(this.props.targetUri)
        ? nuclideUri.getHostname(this.props.targetUri)
        : 'local',
      'launch',
      'gdb',
    ];
  }

  setState(newState: Object): void {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  componentDidMount(): void {
    deserializeDebuggerConfig(
      ...this._getSerializationArgs(),
      (transientSettings, savedSettings) => {
        const program = savedSettings.program || '';
        const workingDirectory =
          savedSettings.workingDirectory ||
          (program.length > 0 ? nuclideUri.dirname(program) : '');
        const environmentVariables = savedSettings.environmentVariables || '';
        const sourcePath = savedSettings.sourcePath || '';
        this.setState({
          program,
          args: savedSettings.args || '',
          workingDirectory,
          environmentVariables,
          sourcePath,
        });
      },
    );

    if (this._program != null) {
      this._program.focus();
    }

    this.props.configIsValidChanged(this._debugButtonShouldEnable());
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': () => {
          if (this._debugButtonShouldEnable()) {
            this._handleLaunchButtonClick();
          }
        },
      }),
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _debugButtonShouldEnable(): boolean {
    return true;
  }

  _onDebuggerBackendChange = (debuggerBackend: ?VsAdapterType): void => {
    this.setState({debuggerBackend});
  };

  render(): React.Node {
    return (
      <div className="block">
        <p>This is intended to debug native programs with gdb.</p>
        <label>Executable: </label>
        <AtomInput
          ref={input => {
            this._program = input;
          }}
          tabIndex="1"
          placeholderText="Input the program you want to launch"
          value={this.state.program}
          onDidChange={value => this.setState({program: value})}
        />
        <label>Arguments: </label>
        <AtomInput
          ref={input => {
            this._args = input;
          }}
          tabIndex="3"
          placeholderText="Arguments to the program (optional)"
          value={this.state.args}
          onDidChange={value => this.setState({args: value})}
        />
        <label>Environment Variables: </label>
        <AtomInput
          ref={input => {
            this._environmentVariables = input;
          }}
          tabIndex="3"
          placeholderText="Environment variables (.e.g, SHELL=/bin/bash PATH=/bin) (optional)"
          value={this.state.environmentVariables}
          onDidChange={value => this.setState({environmentVariables: value})}
        />
        <label>Working directory: </label>
        <AtomInput
          ref={input => {
            this._workingDirectory = input;
          }}
          tabIndex="5"
          placeholderText="Working directory for the launched program (optional)"
          value={this.state.workingDirectory}
          onDidChange={value => this.setState({workingDirectory: value})}
        />
        <label>Source path: </label>
        <AtomInput
          placeholderText="Optional base path for sources"
          value={this.state.sourcePath}
          onDidChange={value => this.setState({sourcePath: value})}
        />
        <label>Debugger backend: </label>
        <Dropdown
          options={this.props.debuggerBackends}
          onChange={this._onDebuggerBackendChange}
          value={this.state.debuggerBackend}
        />
      </div>
    );
  }

  _handleLaunchButtonClick = async (): Promise<void> => {
    track('fb-gdb-debugger-launch-from-dialog');
    const program = nullthrows(this._program)
      .getText()
      .trim();
    const args = shellParse(nullthrows(this._args).getText());
    const workingDirectory = nullthrows(this._workingDirectory)
      .getText()
      .trim();

    const environmentVariables = shellParse(
      nullthrows(this._environmentVariables).getText(),
    );

    const {hostname} = nuclideUri.parse(this.props.targetUri);
    const programUri =
      hostname != null
        ? nuclideUri.createRemoteUri(hostname, program)
        : program;

    const launchInfo = await getNativeVSPLaunchProcessInfo(
      this.state.debuggerBackend,
      programUri,
      args,
      workingDirectory,
      environmentVariables,
      this.state.sourcePath,
    );

    const debuggerService = await getDebuggerService();
    debuggerService.startDebugging(launchInfo);

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      program: this.state.program,
      args: this.state.args,
      workingDirectory: this.state.workingDirectory,
      environmentVariables: this.state.environmentVariables,
      sourcePath: this.state.sourcePath,
    });
  };
}
