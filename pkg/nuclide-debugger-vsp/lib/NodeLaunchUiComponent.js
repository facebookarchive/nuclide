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
} from '../../nuclide-debugger-base';
import {track} from '../../nuclide-analytics';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {getDebuggerService, getNodeLaunchProcessInfo} from './utils';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

function getActiveScriptPath(): string {
  const center = atom.workspace.getCenter
    ? atom.workspace.getCenter()
    : atom.workspace;
  const activeEditor: ?atom$TextEditor = center.getActiveTextEditor();
  if (
    activeEditor == null ||
    !activeEditor.getPath() ||
    !nullthrows(activeEditor.getPath()).endsWith('.js')
  ) {
    return '';
  }
  return nuclideUri.getPath(nullthrows(activeEditor.getPath()));
}

type Props = {|
  +targetUri: NuclideUri,
  +configIsValidChanged: (valid: boolean) => void,
|};

type State = {
  scriptPath: string,
  nodePath: string,
  args: string,
  environmentVariables: string,
  workingDirectory: string,
  outFiles: string,
};

export default class NodeScriptLaunchUiComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      scriptPath: '',
      nodePath: '',
      args: '',
      environmentVariables: '',
      workingDirectory: '',
      outFiles: '',
    };
  }

  _getSerializationArgs() {
    return [
      nuclideUri.isRemote(this.props.targetUri)
        ? nuclideUri.getHostname(this.props.targetUri)
        : 'local',
      'launch',
      'node',
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
        const scriptPath = savedSettings.scriptPath || getActiveScriptPath();
        const workingDirectory =
          savedSettings.workingDirectory ||
          (scriptPath.length > 0 ? nuclideUri.dirname(scriptPath) : '');
        this.setState({
          scriptPath,
          nodePath: savedSettings.nodePath || '',
          args: savedSettings.args || '',
          environmentVariables: savedSettings.environmentVariables || '',
          workingDirectory,
          outFiles: savedSettings.outFiles || '',
        });
      },
    );

    const scriptPathInput = this.refs.scriptPath;
    if (scriptPathInput != null) {
      scriptPathInput.focus();
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
    const {scriptPath} = this.state;
    return scriptPath.length > 0;
  }

  render(): React.Node {
    return (
      <div className="block">
        <p>This is intended to debug node.js files (for node version 6.3+).</p>
        <label>Script Path: </label>
        <AtomInput
          ref="scriptPath"
          tabIndex="1"
          placeholderText="Input the script path you want to launch"
          value={this.state.scriptPath}
          onDidChange={value => this.setState({scriptPath: value})}
        />
        <label>(Optional) Node Runtime Path: </label>
        <p>Will use Nuclide's node version if not provided.</p>
        <AtomInput
          ref="nodePath"
          tabIndex="2"
          placeholderText="Node executable path (e.g. /usr/local/bin/node)"
          value={this.state.nodePath}
          onDidChange={value => this.setState({nodePath: value})}
        />
        <label>(Optional) Arguments: </label>
        <AtomInput
          ref="args"
          tabIndex="3"
          placeholderText="Arguments to the executable"
          value={this.state.args}
          onDidChange={value => this.setState({args: value})}
        />
        <label>(Optional) Environment Variables: </label>
        <AtomInput
          ref="environmentVariables"
          tabIndex="4"
          placeholderText="Environment variables (e.g., SHELL=/bin/bash PATH=/bin)"
          value={this.state.environmentVariables}
          onDidChange={value => this.setState({environmentVariables: value})}
        />
        <label>(Optional) Working directory: </label>
        <AtomInput
          ref="workingDirectory"
          tabIndex="5"
          placeholderText="Working directory for the launched executable"
          value={this.state.workingDirectory}
          onDidChange={value => this.setState({workingDirectory: value})}
        />
        <label>(Optional) source maps output files: </label>
        <AtomInput
          ref="outFiles"
          tabIndex="6"
          placeholderText="Output files pattern (e.g. $projectRoot/out/**/*.js)"
          value={this.state.outFiles}
          onDidChange={value => this.setState({outFiles: value})}
        />
      </div>
    );
  }

  _handleLaunchButtonClick = async (): Promise<void> => {
    track('fb-node-debugger-launch-from-dialog');
    const nodePath = this.refs.nodePath.getText().trim();
    const scriptPath = this.refs.scriptPath.getText().trim();
    const args = shellParse(this.refs.args.getText());
    const workingDirectory = this.refs.workingDirectory.getText().trim();
    const outFiles = this.refs.outFiles.getText().trim();
    const environmentVariables = {};
    shellParse(this.refs.environmentVariables.getText()).forEach(variable => {
      const [key, value] = variable.split('=');
      environmentVariables[key] = value;
    });

    const {hostname} = nuclideUri.parse(this.props.targetUri);
    const scriptUri =
      hostname != null
        ? nuclideUri.createRemoteUri(hostname, scriptPath)
        : scriptPath;

    const launchInfo = await getNodeLaunchProcessInfo(
      scriptUri,
      nodePath,
      args,
      workingDirectory,
      environmentVariables,
      outFiles,
    );

    const debuggerService = await getDebuggerService();
    debuggerService.startDebugging(launchInfo);

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      nodePath: this.state.nodePath,
      scriptPath: this.state.scriptPath,
      args: this.state.args,
      environmentVariables: this.state.environmentVariables,
      workingDirectory: this.state.workingDirectory,
      outFiles: this.state.outFiles,
    });
  };
}
