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
import {AtomInput} from '../../nuclide-ui/AtomInput';
import {LaunchProcessInfo} from './LaunchProcessInfo';
import nuclideUri from '../../commons-node/nuclideUri';
import {DebuggerLaunchAttachEventTypes} from '../../nuclide-debugger-base';
import {Dropdown} from '../../nuclide-ui/Dropdown';
import {
  Button,
  ButtonTypes,
} from '../../nuclide-ui/Button';
import {RemoteConnection} from '../../nuclide-remote-connection';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';

import type EventEmitter from 'events';
import type {NuclideUri} from '../../commons-node/nuclideUri';

type PropsType = {
  targetUri: NuclideUri,
  parentEmitter: EventEmitter,
};

type StateType = {
  pathsDropdownIndex: number,
  pathMenuItems: Array<{label: string, value: number}>,
};

export class LaunchUiComponent extends React.Component<void, PropsType, StateType> {
  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);
    (this: any)._getActiveFilePath = this._getActiveFilePath.bind(this);
    (this: any)._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    (this: any)._handleLaunchButtonClick = this._handleLaunchButtonClick.bind(this);
    (this: any)._handlePathsDropdownChange = this._handlePathsDropdownChange.bind(this);
    this.state = {
      pathsDropdownIndex: 0,
      pathMenuItems: this._getPathMenuItems(),
    };
  }

  componentWillMount() {
    this.props.parentEmitter.on(
      DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED,
      this._handleLaunchButtonClick);
  }

  componentWillUnmount() {
    this.props.parentEmitter.removeListener(
      DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED,
      this._handleLaunchButtonClick);
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
            value={this.state.pathsDropdownIndex}
          />
        </div>
        <label>Command: </label>
        <AtomInput
          ref="scriptPath"
          tabIndex="11"
          placeholderText="/path/to/my/script.php arg1 arg2"
          initialValue={this._getActiveFilePath()}
        />
        <div className="padded text-right">
          <Button onClick={this._handleCancelButtonClick}>
            Cancel
          </Button>
          <Button
            buttonType={ButtonTypes.PRIMARY}
            onClick={this._handleLaunchButtonClick}>
            Launch
          </Button>
        </div>
      </div>
    );
  }

  _getPathMenuItems(): Array<{label: string, value: number}> {
    const hostname = nuclideUri.getHostname(this.props.targetUri);
    const connections = RemoteConnection.getByHostname(hostname);
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
      pathsDropdownIndex: newIndex,
      pathMenuItems: this._getPathMenuItems(),
    });
  }

  _handleLaunchButtonClick(): void {
    const scriptPath = this.refs.scriptPath.getText().trim();
    const processInfo = new LaunchProcessInfo(this.props.targetUri, scriptPath);
    consumeFirstProvider('nuclide-debugger.remote')
      .then(debuggerService => debuggerService.startDebugging(processInfo));
    this._showDebuggerPanel();
    this._handleCancelButtonClick();
  }

  _getActiveFilePath(): string {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor != null) {
      const fileUri = editor.getPath();
      if (fileUri != null && this._isValidScriptUri(fileUri)) {
        return nuclideUri.getPath(fileUri);
      }
    }
    return '';
  }

  _isValidScriptUri(uri: NuclideUri): boolean {
    if (!nuclideUri.isRemote(uri)) {
      return false;
    }
    const scriptPath = nuclideUri.getPath(uri);
    return scriptPath.endsWith('.php') || scriptPath.endsWith('.hh');
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
