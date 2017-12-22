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
} from 'nuclide-debugger-common';
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

  _args: ?AtomInput;
  _environmentVariables: ?AtomInput;
  _nodePath: ?AtomInput;
  _outFiles: ?AtomInput;
  _scriptPath: ?AtomInput;
  _workingDirectory: ?AtomInput;

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

    const scriptPathInput = this._scriptPath;
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
          ref={input => {
            this._scriptPath = input;
          }}
          tabIndex="1"
          placeholderText="Input the script path you want to launch"
          value={this.state.scriptPath}
          onDidChange={value => this.setState({scriptPath: value})}
        />
        <label>(Optional) Node Runtime Path: </label>
        <p>Will use Nuclide's node version if not provided.</p>
        <AtomInput
          ref={input => {
            this._nodePath = input;
          }}
          tabIndex="2"
          placeholderText="Node executable path (e.g. /usr/local/bin/node)"
          value={this.state.nodePath}
          onDidChange={value => this.setState({nodePath: value})}
        />
        <label>(Optional) Arguments: </label>
        <AtomInput
          ref={input => {
            this._args = input;
          }}
          tabIndex="3"
          placeholderText="Arguments to the executable"
          value={this.state.args}
          onDidChange={value => this.setState({args: value})}
        />
        <label>(Optional) Environment Variables: </label>
        <AtomInput
          ref={input => {
            this._environmentVariables = input;
          }}
          tabIndex="4"
          placeholderText="Environment variables (e.g., SHELL=/bin/bash PATH=/bin)"
          value={this.state.environmentVariables}
          onDidChange={value => this.setState({environmentVariables: value})}
        />
        <label>(Optional) Working directory: </label>
        <AtomInput
          ref={input => {
            this._workingDirectory = input;
          }}
          tabIndex="5"
          placeholderText="Working directory for the launched executable"
          value={this.state.workingDirectory}
          onDidChange={value => this.setState({workingDirectory: value})}
        />
        <label>(Optional) source maps output files: </label>
        <AtomInput
          ref={input => {
            this._outFiles = input;
          }}
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
    const nodePath = nullthrows(this._nodePath)
      .getText()
      .trim();
    const scriptPath = nullthrows(this._scriptPath)
      .getText()
      .trim();
    const args = shellParse(nullthrows(this._args).getText());
    const workingDirectory = nullthrows(this._workingDirectory)
      .getText()
      .trim();
    const outFiles = nullthrows(this._outFiles)
      .getText()
      .trim();
    const environmentVariables = {};
    shellParse(nullthrows(this._environmentVariables).getText()).forEach(
      variable => {
        const [key, value] = variable.split('=');
        environmentVariables[key] = value;
      },
    );

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
