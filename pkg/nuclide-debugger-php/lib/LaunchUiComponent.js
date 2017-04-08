/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/* global localStorage */

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

const MAX_RECENTLY_LAUNCHED = 5;

type PropsType = {
  targetUri: NuclideUri,
  parentEmitter: EventEmitter,
};

type StateType = {
  pathsDropdownIndex: number,
  pathMenuItems: Array<{label: string, value: number}>,
  recentlyLaunchedScripts: Array<{label: string, value: string}>,
  recentlyLaunchedScript: ?string,
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
    (this: any)._handleRecentSelectionChange = this._handleRecentSelectionChange.bind(this);
    this.state = {
      pathsDropdownIndex: 0,
      pathMenuItems: this._getPathMenuItems(),
      recentlyLaunchedScripts: this._getRecentlyLaunchedScripts(),
      recentlyLaunchedScript: null,
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
        <label>Recently launched commands: </label>
        <Dropdown
          className="inline-block nuclide-debugger-recently-launched"
          options={[{label: '', value: null}, ...this.state.recentlyLaunchedScripts]}
          onChange={this._handleRecentSelectionChange}
          value={this.state.recentlyLaunchedScript}
        />
        <label>Command: </label>
        <AtomInput
          ref="scriptPath"
          tabIndex="11"
          placeholderText="/path/to/my/script.php arg1 arg2"
          initialValue={this._getActiveFilePath()}
          value={this.state.recentlyLaunchedScript || ''}
          sugges
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

  _getRecentlyLaunchedKey() {
    const hostname = nuclideUri.getHostname(this.props.targetUri);
    return 'nuclide-debugger-php.recentlyLaunchedScripts:' + hostname;
  }

  _getRecentlyLaunchedScripts(): Array<{label: string, value: string}> {
    const recentlyLaunched = localStorage.getItem(this._getRecentlyLaunchedKey());
    if (recentlyLaunched == null) {
      return [];
    }

    const items = JSON.parse(String(recentlyLaunched));
    return items
      .filter(script => script !== '')
      .map(script => {
        return {
          label: script,
          value: script,
        };
      });
  }

  _setRecentlyLaunchedScript(
    script: string,
    recentlyLaunched: Array<{label: string, value: string}>,
  ): void {
    // Act like a simple MRU cache, move the script being launched to the front.
    // NOTE: this array is expected to be really tiny.
    const scriptNames = [script];
    recentlyLaunched.forEach(item => {
      if (item.label !== script && scriptNames.length < MAX_RECENTLY_LAUNCHED) {
        scriptNames.push(item.label);
      }
    });

    localStorage.setItem(this._getRecentlyLaunchedKey(), JSON.stringify(scriptNames));
    this.setState({
      recentlyLaunchedScripts: this._getRecentlyLaunchedScripts(),
      recentlyLaunchedScript: script,
    });
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

  _handleRecentSelectionChange(newValue: string): void {
    this.setState({
      recentlyLaunchedScript: newValue,
    });
  }

  _handleLaunchButtonClick(): void {
    const scriptPath = this.refs.scriptPath.getText().trim();
    this._setRecentlyLaunchedScript(scriptPath, this.state.recentlyLaunchedScripts);

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
