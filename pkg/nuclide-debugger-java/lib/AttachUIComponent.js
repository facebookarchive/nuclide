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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import * as React from 'react';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import nuclideUri from 'nuclide-commons/nuclideUri';
import nullthrows from 'nullthrows';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import {setupJavaDebuggerService} from './JavaDebuggerServiceHelpers';

type Props = {|
  targetUri: NuclideUri,
  configIsValidChanged: (valid: boolean) => void,
|};

type State = {
  jdwpPort: string,
};

export class AttachUIComponent extends React.Component<Props, State> {
  props: Props;
  state: State;
  _disposables: UniversalDisposable;
  _jdwpPort: ?AtomInput;

  constructor(props: Props) {
    super(props);

    this._disposables = new UniversalDisposable();
    this.state = {
      jdwpPort: '',
    };
  }

  _getSerializationArgs() {
    return [
      nuclideUri.isRemote(this.props.targetUri)
        ? nuclideUri.getHostname(this.props.targetUri)
        : 'local',
      'attach',
      'Java',
    ];
  }

  componentDidMount(): void {
    deserializeDebuggerConfig(
      ...this._getSerializationArgs(),
      (transientSettings, savedSettings) => {
        this.setState({
          jdwpPort: savedSettings.jdwpPort || '',
        });
      },
    );

    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': async (): Promise<void> => {
          if (this._debugButtonShouldEnable()) {
            await this._handleAttachClick();
          }
        },
      }),
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState: Object): void {
    super.setState(newState, () =>
      this.props.configIsValidChanged(this._debugButtonShouldEnable()),
    );
  }

  _debugButtonShouldEnable(): boolean {
    return this.state.jdwpPort.trim() !== '';
  }

  render(): React.Node {
    // TODO: smart fill the working directory textbox.
    return (
      <div className="block">
        <label>Java JDWP Port: </label>
        <AtomInput
          ref={input => {
            this._jdwpPort = input;
          }}
          placeholderText="Java debugger port"
          value={this.state.jdwpPort}
          onDidChange={value => this.setState({jdwpPort: value})}
          autofocus={true}
        />
      </div>
    );
  }

  _handleAttachClick = async (): Promise<void> => {
    // TODO: perform some validation for the input.
    const javaPort = parseInt(
      nullthrows(this._jdwpPort)
        .getText()
        .trim(),
      10,
    );

    await setupJavaDebuggerService(this.props.targetUri, 'attach', {
      machineName: 'localhost',
      port: javaPort,
    });

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      jdwpPort: this.state.jdwpPort,
    });
  };
}
