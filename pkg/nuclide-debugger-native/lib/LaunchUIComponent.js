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

import React from 'react';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import {Button, ButtonTypes} from 'nuclide-commons-ui/Button';
import {ButtonGroup} from 'nuclide-commons-ui/ButtonGroup';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

type PropsType = {
  store: LaunchAttachStore,
  actions: LaunchAttachActions,
  configIsValidChanged: (valid: boolean) => void,
};

export class LaunchUIComponent extends React.Component<void, PropsType, void> {
  props: PropsType;
  _disposables: UniversalDisposable;

  constructor(props: PropsType) {
    super(props);
    (this: any)._handleLaunchClick = this._handleLaunchClick.bind(this);

    this._disposables = new UniversalDisposable();
  }

  componentDidMount(): void {
    const launchExecutableInput = this.refs.launchExecutable;
    if (launchExecutableInput != null) {
      launchExecutableInput.focus();
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

  render(): React.Element<any> {
    // TODO: smart fill the working directory textbox.
    // TODO: make tab stop between textbox work.
    // Reserve tabIndex [1~10] to header portion of the UI so we start from "11" here.
    return (
      <div className="block">
        <label>Executable: </label>
        <AtomInput
          ref="launchExecutable"
          tabIndex="11"
          placeholderText="Input the executable path you want to launch"
        />
        <label>Arguments: </label>
        <AtomInput
          ref="launchArguments"
          tabIndex="12"
          placeholderText="Arguments to the executable"
        />
        <label>Environment Variables: </label>
        <AtomInput
          ref="launchEnvironmentVariables"
          tabIndex="13"
          placeholderText="Environment variables (e.g., SHELL=/bin/bash PATH=/bin)"
        />
        <label>Working directory: </label>
        <AtomInput
          ref="launchWorkingDirectory"
          tabIndex="14"
          placeholderText="Working directory for the launched executable"
        />
        <label>Stdin file: </label>
        <AtomInput
          ref="stdinFilePath"
          tabIndex="15"
          placeholderText="Redirect stdin to this file"
        />
      </div>
    );
  }

  _handleLaunchClick(): void {
    // TODO: perform some validation for the input.
    const launchExecutable = this.refs.launchExecutable.getText().trim();
    const launchArguments = shellParse(this.refs.launchArguments.getText());
    const launchEnvironmentVariables = shellParse(
      this.refs.launchEnvironmentVariables.getText(),
    );
    const launchWorkingDirectory = this.refs.launchWorkingDirectory
      .getText()
      .trim();
    const stdinFilePath = this.refs.stdinFilePath.getText().trim();
    const launchTarget = {
      executablePath: launchExecutable,
      arguments: launchArguments,
      environmentVariables: launchEnvironmentVariables,
      workingDirectory: launchWorkingDirectory,
      stdinFilePath,
    };
    // Fire and forget.
    this.props.actions.launchDebugger(launchTarget);
  }
}
