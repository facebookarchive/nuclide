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

import * as React from 'react';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import {debugJavaDebuggerService} from './JavaDebuggerServiceHelpers';

type Props = {|
  targetUri: NuclideUri,
  configIsValidChanged: (valid: boolean) => void,
|};

type State = {
  launchCommandLine: string,
  classPath: string,
};

export class LaunchUIComponent extends React.Component<Props, State> {
  props: Props;
  state: State;
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);

    this._disposables = new UniversalDisposable();
    this.state = {
      launchCommandLine: '',
      classPath: '',
    };
  }

  _getSerializationArgs() {
    return [
      nuclideUri.isRemote(this.props.targetUri)
        ? nuclideUri.getHostname(this.props.targetUri)
        : 'local',
      'launch',
      'Java',
    ];
  }

  componentDidMount(): void {
    deserializeDebuggerConfig(
      ...this._getSerializationArgs(),
      (transientSettings, savedSettings) => {
        this.setState({
          launchCommandLine: savedSettings.launchCommandLine || '',
          classPath: savedSettings.classPath || '',
        });
      },
    );

    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': async (): Promise<void> => {
          if (this._debugButtonShouldEnable()) {
            await this._handleLaunchClick();
          }
        },
      }),
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState: Object): void {
    super.setState(newState, () =>
      this.props.configIsValidChanged(this._debugButtonShouldEnable()),
    );
  }

  _debugButtonShouldEnable = (): boolean => {
    return this.state.launchCommandLine.trim() !== '';
  };

  render(): React.Node {
    // TODO: smart fill the working directory textbox.
    return (
      <div className="block">
        <label>Entry Point Class: </label>
        <AtomInput
          placeholderText="Input the Java entry point name you want to launch"
          value={this.state.launchCommandLine}
          onDidChange={value => this.setState({launchCommandLine: value})}
          autofocus={true}
        />
        <label>Class Path: </label>
        <AtomInput
          placeholderText="Java class path"
          value={this.state.classPath}
          onDidChange={value => this.setState({classPath: value})}
        />
      </div>
    );
  }

  _handleLaunchClick = async (): Promise<void> => {
    // TODO: perform some validation for the input.
    const commandLine = this.state.launchCommandLine.trim();
    const classPath = this.state.classPath.trim();

    await debugJavaDebuggerService(this.props.targetUri, {
      debugMode: 'launch',
      commandLine,
      classPath,
    });

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      launchCommandLine: this.state.launchCommandLine,
      classPath: this.state.classPath,
    });
  };
}
