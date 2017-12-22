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
import {getDebuggerService, getPythonScriptLaunchProcessInfo} from './utils';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

function getActiveScriptPath(): string {
  const center = atom.workspace.getCenter
    ? atom.workspace.getCenter()
    : atom.workspace;
  const activeEditor: ?atom$TextEditor = center.getActiveTextEditor();
  if (
    activeEditor == null ||
    !activeEditor.getPath() ||
    !nullthrows(activeEditor.getPath()).endsWith('.py')
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
  pythonPath: string,
  args: string,
  environmentVariables: string,
  workingDirectory: string,
};

export default class PythonScriptLaunchUiComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;

  _args: ?AtomInput;
  _environmentVariables: ?AtomInput;
  _pythonPath: ?AtomInput;
  _scriptPath: ?AtomInput;
  _workingDirectory: ?AtomInput;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      scriptPath: '',
      pythonPath: '',
      args: '',
      environmentVariables: '',
      workingDirectory: '',
    };
  }

  _getSerializationArgs() {
    return [
      nuclideUri.isRemote(this.props.targetUri)
        ? nuclideUri.getHostname(this.props.targetUri)
        : 'local',
      'launch',
      'python',
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
          pythonPath: savedSettings.pythonPath || '',
          args: savedSettings.args || '',
          environmentVariables: savedSettings.environmentVariables || '',
          workingDirectory,
        });
      },
    );

    if (this._scriptPath != null) {
      this._scriptPath.focus();
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
    const {scriptPath, pythonPath} = this.state;
    return scriptPath.length > 0 && pythonPath.length > 0;
  }

  render(): React.Node {
    const nuclidePythonDebuggerDexUri =
      'https://our.intern.facebook.com/intern/dex/python-and-fbcode/debugging/#nuclide';
    return (
      <div className="block">
        <p>
          This is intended to debug python script files.
          <br />
          To debug buck targets, you should{' '}
          <a href={nuclidePythonDebuggerDexUri}>
            use the buck toolbar instead
          </a>.
        </p>
        <label>Script Path: </label>
        <AtomInput
          ref={input => {
            this._scriptPath = input;
          }}
          tabIndex="12"
          placeholderText="Input the script path you want to launch"
          value={this.state.scriptPath}
          onDidChange={value => this.setState({scriptPath: value})}
        />
        <label>Python Path: </label>
        <AtomInput
          ref={input => {
            this._pythonPath = input;
          }}
          tabIndex="11"
          placeholderText="Input python executable path (e.g. /usr/bin/python)"
          value={this.state.pythonPath}
          onDidChange={value => this.setState({pythonPath: value})}
        />
        <label>Arguments: </label>
        <AtomInput
          ref={input => {
            this._args = input;
          }}
          tabIndex="13"
          placeholderText="Arguments to the executable"
          value={this.state.args}
          onDidChange={value => this.setState({args: value})}
        />
        <label>Environment Variables: </label>
        <AtomInput
          ref={input => {
            this._environmentVariables = input;
          }}
          tabIndex="14"
          placeholderText="Environment variables (e.g., SHELL=/bin/bash PATH=/bin)"
          value={this.state.environmentVariables}
          onDidChange={value => this.setState({environmentVariables: value})}
        />
        <label>Working directory: </label>
        <AtomInput
          ref={input => {
            this._workingDirectory = input;
          }}
          tabIndex="15"
          placeholderText="Working directory for the launched executable"
          value={this.state.workingDirectory}
          onDidChange={value => this.setState({workingDirectory: value})}
        />
      </div>
    );
  }

  _handleLaunchButtonClick = async (): Promise<void> => {
    track('fb-python-debugger-launch-from-dialog');
    const pythonPath = nullthrows(this._pythonPath)
      .getText()
      .trim();
    const scriptPath = nullthrows(this._scriptPath)
      .getText()
      .trim();
    const args = shellParse(nullthrows(this._args).getText());
    const workingDirectory = nullthrows(this._workingDirectory)
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

    const launchInfo = await getPythonScriptLaunchProcessInfo(
      scriptUri,
      pythonPath,
      args,
      workingDirectory,
      environmentVariables,
    );

    const debuggerService = await getDebuggerService();
    debuggerService.startDebugging(launchInfo);

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      pythonPath: this.state.pythonPath,
      scriptPath: this.state.scriptPath,
      args: this.state.args,
      environmentVariables: this.state.environmentVariables,
      workingDirectory: this.state.workingDirectory,
    });
  };
}
