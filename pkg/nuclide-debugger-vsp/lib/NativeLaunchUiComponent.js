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

import * as React from 'react';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
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
import {getGdbLaunchProcessInfo} from './utils';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

type Props = {|
  +targetUri: NuclideUri,
  +configIsValidChanged: (valid: boolean) => void,
|};

type State = {
  program: string,
  args: string,
  workingDirectory: string,
};

export default class NativeLaunchUiComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;

  _program: ?AtomInput;
  _args: ?AtomInput;
  _workingDirectory: ?AtomInput;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      program: '',
      args: '',
      workingDirectory: '',
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
        this.setState({
          program,
          args: savedSettings.args || '',
          workingDirectory,
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
        <label>(Optional) Working directory: </label>
        <AtomInput
          ref={input => {
            this._workingDirectory = input;
          }}
          tabIndex="5"
          placeholderText="Working directory for the launched program"
          value={this.state.workingDirectory}
          onDidChange={value => this.setState({workingDirectory: value})}
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

    const {hostname} = nuclideUri.parse(this.props.targetUri);
    const programUri =
      hostname != null
        ? nuclideUri.createRemoteUri(hostname, program)
        : program;

    const launchInfo = await getGdbLaunchProcessInfo(
      programUri,
      args,
      workingDirectory,
    );

    const debuggerService = await getDebuggerService();
    debuggerService.startDebugging(launchInfo);

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      program: this.state.program,
      args: this.state.args,
      workingDirectory: this.state.workingDirectory,
    });
  };
}
