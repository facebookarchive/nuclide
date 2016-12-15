/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type EventEmitter from 'events';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import {LaunchProcessInfo} from './LaunchProcessInfo';
import {DebuggerLaunchAttachEventTypes} from '../../nuclide-debugger-base';
import {React} from 'react-for-atom';
import {AtomInput} from '../../nuclide-ui/AtomInput';
import {
  Button,
  ButtonTypes,
} from '../../nuclide-ui/Button';
import {ButtonGroup} from '../../nuclide-ui/ButtonGroup';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';

type PropsType = {
  targetUri: NuclideUri,
  parentEmitter: EventEmitter,
};

export class LaunchUIComponent extends React.Component<void, PropsType, void> {
  props: PropsType;

  constructor(props: PropsType) {
    super(props);
    (this: any)._handleLaunchClick = this._handleLaunchClick.bind(this);
    (this: any)._cancelClick = this._cancelClick.bind(this);
  }

  componentWillMount() {
    this.props.parentEmitter.on(
      DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED,
      this._handleLaunchClick);
  }

  componentDidMount(): void {
    const launchExecutableInput = this.refs.launchExecutable;
    if (launchExecutableInput != null) {
      launchExecutableInput.focus();
    }
  }

  componentWillUnmount() {
    this.props.parentEmitter.removeListener(
      DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED,
      this._handleLaunchClick);
  }

  render(): React.Element<any> {
    // TODO: smart fill the working directory textbox.
    // TODO: make tab stop between textbox work.
    // Reserve tabIndex [1~10] to header portion of the UI so we start from "11" here.
    return (
      <div className="block">
        <label>Entry Point Class: </label>
        <AtomInput
          ref="launchCommandLine"
          tabIndex="11"
          placeholderText="Input the Java entry point name you want to launch"
        />
        <label>Class Path: </label>
        <AtomInput
          ref="classPath"
          tabIndex="12"
          placeholderText="Java class path"
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
    const commandLine = this.refs.launchCommandLine.getText().trim();
    const classPath = this.refs.classPath.getText().trim();
    const processInfo = new LaunchProcessInfo(
      this.props.targetUri,
      {
        commandLine,
        classPath,
      },
    );
    consumeFirstProvider('nuclide-debugger.remote')
      .then(debuggerService => debuggerService.startDebugging(processInfo));
    this._showDebuggerPanel();
    this._handleCancelButtonClick();
  }

  _showDebuggerPanel(): void {
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:show',
    );
  }

  _handleCancelButtonClick(): void {
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:toggle-launch-attach',
    );
  }
}
