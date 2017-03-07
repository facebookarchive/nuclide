/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import {AttachProcessInfo} from './AttachProcessInfo';
import {
  Button,
  ButtonTypes,
} from '../../nuclide-ui/Button';
import {DebuggerLaunchAttachEventTypes} from '../../nuclide-debugger-base';
import {Dropdown} from '../../nuclide-ui/Dropdown';
import {RemoteConnection} from '../../nuclide-remote-connection';
import nuclideUri from '../../commons-node/nuclideUri';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';

import type {NuclideUri} from '../../commons-node/nuclideUri';

import type EventEmitter from 'events';

type PropsType = {
  targetUri: NuclideUri,
  parentEmitter: EventEmitter,
};

type StateType = {
  selectedPathIndex: number,
  pathMenuItems: Array<{label: string, value: number}>,
};

export class AttachUiComponent extends React.Component<void, PropsType, StateType> {
  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);
    (this: any)._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    (this: any)._handleAttachButtonClick = this._handleAttachButtonClick.bind(this);
    (this: any)._handlePathsDropdownChange = this._handlePathsDropdownChange.bind(this);
    this.state = {
      selectedPathIndex: 0,
      pathMenuItems: this._getPathMenuItems(),
    };
  }

  componentWillMount() {
    this.props.parentEmitter.on(
      DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED,
      this._handleAttachButtonClick);
  }

  componentWillUnmount() {
    this.props.parentEmitter.removeListener(
      DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED,
      this._handleAttachButtonClick);
  }

  render(): React.Element<any> {
    return (
      <div className="block">
        <div className="nuclide-debugger-php-launch-attach-ui-select-project">
          <label>Selected Project Directory: </label>
          <Dropdown
            className="inline-block nuclide-debugger-connection-box"
            options={this.state.pathMenuItems}
            onChange={this._handlePathsDropdownChange}
            value={this.state.selectedPathIndex}
          />
        </div>
        <div className="padded text-right">
          <Button onClick={this._handleCancelButtonClick}>Cancel</Button>
          <Button
            buttonType={ButtonTypes.PRIMARY}
            onClick={this._handleAttachButtonClick}>
            Attach
          </Button>
        </div>
      </div>
    );
  }

  _getPathMenuItems(): Array<{label: string, value: number}> {
    const connections = RemoteConnection.getByHostname(
      nuclideUri.getHostname(this.props.targetUri),
    );
    return connections.map((connection, index) => {
      const pathToProject = connection.getPathForInitialWorkingDirectory();
      return {
        label: pathToProject,
        value: index,
      };
    });
  }

  _handlePathsDropdownChange(newIndex: number): void {
    this.setState({
      selectedPathIndex: newIndex,
      pathMenuItems: this._getPathMenuItems(),
    });
  }

  _handleAttachButtonClick(): void {
    // Start a debug session with the user-supplied information.
    const {hostname} = nuclideUri.parseRemoteUri(this.props.targetUri);
    const selectedPath = this.state.pathMenuItems[this.state.selectedPathIndex].label;
    const processInfo = new AttachProcessInfo(
      nuclideUri.createRemoteUri(hostname, selectedPath),
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
