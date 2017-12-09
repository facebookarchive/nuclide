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

import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

import * as React from 'react';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from '../../nuclide-debugger-base';
import {
  getReactNativeAttachProcessInfo,
  getDebuggerService,
  REACT_NATIVE_PACKAGER_DEFAULT_PORT,
} from './utils';

type PropsType = {
  configIsValidChanged: (valid: boolean) => void,
};

type StateType = {
  workspacePath: string,
  port: string,
};

export default class ReactAttachLaunchUiComponent extends React.Component<
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
      workspacePath: '',
      port: REACT_NATIVE_PACKAGER_DEFAULT_PORT.toString(),
    };
  }

  _getSerializationArgs() {
    return ['local', 'launch', 'React Native'];
  }

  componentDidMount(): void {
    deserializeDebuggerConfig(
      ...this._getSerializationArgs(),
      (transientSettings, savedSettings) => {
        this.setState({
          workspacePath: savedSettings.workspacePath || '',
          port: savedSettings.port || '',
        });
      },
    );

    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': () => {
          if (this._debugButtonShouldEnable()) {
            this._handleLaunchClick();
          }
        },
      }),
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState: Object): void {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  _debugButtonShouldEnable = (): boolean => {
    return this.state.workspacePath.trim() !== '';
  };

  render(): React.Node {
    return (
      <div className="block">
        <label>Workspace path (should contain package.json): </label>
        <AtomInput
          placeholderText="Path containing package.json"
          value={this.state.workspacePath}
          onDidChange={value => this.setState({workspacePath: value})}
          autofocus={true}
        />
        <label>Debug port number: </label>
        <AtomInput
          tabIndex="1"
          placeholderText={`React Native packager port (default ${REACT_NATIVE_PACKAGER_DEFAULT_PORT})`}
          value={this.state.port}
          onDidChange={port => this.setState({port})}
        />
        {this.state.port !== REACT_NATIVE_PACKAGER_DEFAULT_PORT.toString() && (
          <label>
            Note: first consult{' '}
            <a href="https://github.com/facebook/react-native/issues/9145">
              React Native issue #9145
            </a>{' '}
            for setting a port other than 8081.
          </label>
        )}
      </div>
    );
  }

  _handleLaunchClick = async (): Promise<void> => {
    const workspace = this.state.workspacePath.trim();
    const port = this.state.port;

    const launchInfo = await getReactNativeAttachProcessInfo(workspace, port);

    const debuggerService = await getDebuggerService();
    debuggerService.startDebugging(launchInfo);

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      workspacePath: this.state.workspacePath,
      port: this.state.port,
    });
  };
}
