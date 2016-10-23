'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {shellParse} from '../../commons-node/string';

import type {LaunchAttachStore} from './LaunchAttachStore';
import type {LaunchAttachActions} from './LaunchAttachActions';

import {React} from 'react-for-atom';
import {AtomInput} from '../../nuclide-ui/AtomInput';
import {
  Button,
  ButtonTypes,
} from '../../nuclide-ui/Button';
import {ButtonGroup} from '../../nuclide-ui/ButtonGroup';

type PropsType = {
  store: LaunchAttachStore,
  actions: LaunchAttachActions,
};

export class LaunchUIComponent extends React.Component<void, PropsType, void> {
  props: PropsType;

  constructor(props: PropsType) {
    super(props);
    (this: any)._handleLaunchClick = this._handleLaunchClick.bind(this);
    (this: any)._cancelClick = this._cancelClick.bind(this);
  }

  componentDidMount(): void {
    const launchExecutableInput = this.refs.launchExecutable;
    if (launchExecutableInput != null) {
      launchExecutableInput.focus();
    }
  }

  render(): React.Element<*> {
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
          onConfirm={this._handleLaunchClick}
        />
        <label>Arguments: </label>
        <AtomInput
          ref="launchArguments"
          tabIndex="12"
          placeholderText="Arguments to the executable"
          onConfirm={this._handleLaunchClick}
        />
        <label>Environment Variables: </label>
        <AtomInput
          ref="launchEnvironmentVariables"
          tabIndex="13"
          placeholderText="Environment variables (e.g., SHELL=/bin/bash PATH=/bin)"
          onConfirm={this._handleLaunchClick}
        />
        <label>Working directory: </label>
        <AtomInput
          ref="launchWorkingDirectory"
          tabIndex="14"
          placeholderText="Working directory for the launched executable"
          onConfirm={this._handleLaunchClick}
        />
        <label>Stdin file: </label>
        <AtomInput
          ref="stdinFilePath"
          tabIndex="15"
          placeholderText="Redirect stdin to this file"
          onConfirm={this._handleLaunchClick}
        />
        <div style={{display: 'flex', flexDirection: 'row-reverse'}}>
          <ButtonGroup>
            <Button
              tabIndex="17"
              onClick={this._cancelClick}>
              Cancel
            </Button>
            <Button
              buttonType={ButtonTypes.PRIMARY}
              tabIndex="16"
              onClick={this._handleLaunchClick}>
              Launch
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }

  _cancelClick(): void {
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:toggle-launch-attach',
    );
  }

  _handleLaunchClick(): void {
    // TODO: perform some validation for the input.
    const launchExecutable = this.refs.launchExecutable.getText().trim();
    const launchArguments = shellParse(this.refs.launchArguments.getText());
    const launchEnvironmentVariables = shellParse(
      this.refs.launchEnvironmentVariables.getText());
    const launchWorkingDirectory = this.refs.launchWorkingDirectory.getText().trim();
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
    this.props.actions.showDebuggerPanel();
    this.props.actions.toggleLaunchAttachDialog();
  }
}
