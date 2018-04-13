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

import type {ReactNativeAttachArgs} from './types';

import {REACT_NATIVE_PACKAGER_DEFAULT_PORT} from './utils';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import {Checkbox} from 'nuclide-commons-ui/Checkbox';
import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as React from 'react';

export type CommonPropsType = {
  configIsValidChanged: (valid: boolean) => void,
};

export type CommonStateType = {
  workspacePath: string,
  port: string,
  sourceMaps: boolean,
  sourceMapPathOverrides: string,
  outDir: string,
};

export default class ReactNativeCommonUiComponent<
  StateType: CommonStateType,
> extends React.Component<CommonPropsType, StateType> {
  props: CommonPropsType;
  state: StateType;
  _disposables: UniversalDisposable;

  constructor(props: CommonPropsType) {
    super(props);

    this._disposables = new UniversalDisposable();
  }

  deserializeState() {
    throw new Error('Deserialize debugger not implemented!');
  }

  componentDidMount(): void {
    this.deserializeState();
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': () => {
          if (this._debugButtonShouldEnable()) {
            this.handleLaunchClick();
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
    return this.state.workspacePath.trim() !== '';
  };

  _deriveProgramFromWorkspace(workspacePath: string): string {
    return nuclideUri.getPath(
      nuclideUri.join(workspacePath, '.vscode', 'launchReactNative.js'),
    );
  }

  _deriveOutDirFromWorkspace(workspacePath: string): string {
    return nuclideUri.getPath(
      nuclideUri.join(workspacePath, '.vscode', '.react'),
    );
  }

  stateToArgs(): ReactNativeAttachArgs {
    const workspace = this.state.workspacePath.trim();
    const {sourceMaps} = this.state;
    const program = this._deriveProgramFromWorkspace(workspace);
    let {outDir} = this.state;
    if (outDir.length === 0) {
      outDir = this._deriveOutDirFromWorkspace(workspace);
    }
    // If parsing fails we fall back to default.
    let port = REACT_NATIVE_PACKAGER_DEFAULT_PORT;
    let sourceMapPathOverrides = {};
    try {
      port = Number.parseInt(this.state.port, 10);
      sourceMapPathOverrides = JSON.parse(this.state.sourceMapPathOverrides);
    } catch (e) {}
    return {program, outDir, sourceMapPathOverrides, port, sourceMaps};
  }

  render(): React.Node {
    return (
      <div className="block">
        <label>Workspace absolute path (should contain package.json): </label>
        <AtomInput
          placeholderText="Absolute path containing package.json"
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
        <br />
        <Checkbox
          checked={this.state.sourceMaps}
          label="Use sourcemaps"
          onChange={checked => this.setState({sourceMaps: checked})}
        />
        <br />
        <label>Location for output bundle files:</label>
        <AtomInput
          tabIndex="1"
          placeholderText="Default: ${WorkspacePath}/.vscode/.react"
          value=""
          onDidChange={outDir => this.setState({outDir})}
        />
        <label>
          Source map path overrides.{' '}
          <a href="https://github.com/Microsoft/vscode-node-debug2#sourcemappathoverrides">
            (see documentation on GitHub)
          </a>
        </label>
        <AtomInput
          tabIndex="1"
          placeholderText="(Optional) JSON-parsable text."
          value=""
          onDidChange={sourceMapPathOverrides =>
            this.setState({sourceMapPathOverrides})
          }
        />
      </div>
    );
  }

  handleLaunchClick = async (): Promise<void> => {
    throw new Error('Launch click not implemented!');
  };
}
