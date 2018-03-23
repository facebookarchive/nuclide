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
import nullthrows from 'nullthrows';
import {shellParse} from 'nuclide-commons/string';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import {getDebuggerService} from '../../commons-atom/debugger';
import {track} from '../../nuclide-analytics';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {getPrepackLaunchProcessInfo, getActiveScriptPath} from './utils';

const JS_EXTENSION = '.js';

type Props = {|
  +configIsValidChanged: (valid: boolean) => void,
|};

type State = {
  scriptPath: string,
  prepackPath: string,
  args: string,
};

export default class PrepackScriptLaunchUiComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;
  _scriptPath: ?AtomInput;
  _prepackPath: ?AtomInput;
  _args: ?AtomInput;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      scriptPath: '',
      prepackPath: '',
      args: '',
    };
  }

  _getSerializationArgs() {
    return ['local', 'launch', 'Prepack'];
  }

  setState(newState: Object): void {
    super.setState(newState, () =>
      this.props.configIsValidChanged(this._debugButtonShouldEnable()),
    );
  }

  componentDidMount(): void {
    deserializeDebuggerConfig(
      ...this._getSerializationArgs(),
      (transientSettings, savedSettings) => {
        const scriptPath =
          savedSettings.scriptPath || getActiveScriptPath(JS_EXTENSION);
        this.setState({
          scriptPath,
          prepackPath: savedSettings.prepackPath || '',
          args: savedSettings.args || '',
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
        <p>This is intended to debug Prepack.</p>
        <label>File to Prepack: </label>
        <AtomInput
          ref={input => {
            this._scriptPath = input;
          }}
          tabIndex="1"
          placeholderText="Input the file you want to Prepack"
          value={this.state.scriptPath}
          onDidChange={value => this.setState({scriptPath: value})}
        />
        <label>(Optional) Prepack Runtime Path: </label>
        <p>Will use default `prepack` command if not provided.</p>
        <AtomInput
          ref={input => {
            this._prepackPath = input;
          }}
          tabIndex="2"
          placeholderText="Prepack executable path (e.g. lib/prepack-cli.js)"
          value={this.state.prepackPath}
          onDidChange={value => this.setState({prepackPath: value})}
        />
        <label>(Optional) Arguments: </label>
        <AtomInput
          ref={input => {
            this._args = input;
          }}
          tabIndex="3"
          placeholderText="Arguments to start Prepack"
          value={this.state.args}
          onDidChange={value => this.setState({args: value})}
        />
      </div>
    );
  }

  _handleLaunchButtonClick = async (): Promise<void> => {
    track('nuclide-prepack-debugger-launch-from-dialog');
    const prepackPath = nullthrows(this._prepackPath)
      .getText()
      .trim();
    const scriptPath = nullthrows(this._scriptPath)
      .getText()
      .trim();
    const args = shellParse(nullthrows(this._args).getText());

    const scriptUri = scriptPath;

    const launchInfo = await getPrepackLaunchProcessInfo(
      scriptUri,
      prepackPath,
      args,
    );

    const debuggerService = await getDebuggerService();
    debuggerService.startDebugging(launchInfo);

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      prepackPath: this.state.prepackPath,
      scriptPath: this.state.scriptPath,
      args: this.state.args,
    });
  };
}
