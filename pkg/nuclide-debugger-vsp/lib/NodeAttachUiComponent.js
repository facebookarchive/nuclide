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
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from '../../nuclide-debugger-base';
import {track} from '../../nuclide-analytics';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {getDebuggerService, getNodeAttachProcessInfo} from './utils';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

type Props = {|
  +targetUri: NuclideUri,
  +configIsValidChanged: (valid: boolean) => void,
|};

type State = {
  port: string,
};

export default class NodeScriptAttachUiComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      port: '',
    };
  }

  _getSerializationArgs() {
    return [
      nuclideUri.isRemote(this.props.targetUri)
        ? nuclideUri.getHostname(this.props.targetUri)
        : 'local',
      'attach',
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
        this.setState({
          port: savedSettings.port || '',
        });
      },
    );

    const portInput = this.refs.port;
    if (portInput != null) {
      portInput.focus();
    }

    this.props.configIsValidChanged(this._debugButtonShouldEnable());
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': () => {
          if (this._debugButtonShouldEnable()) {
            this._handleAttachButtonClick();
          }
        },
      }),
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _debugButtonShouldEnable(): boolean {
    const {port} = this.state;
    return port.length > 0 && !isNaN(port);
  }

  render(): React.Node {
    return (
      <div className="block">
        <p>Attach to a running node.js process</p>
        <label>Debug port number: </label>
        <AtomInput
          ref="port"
          tabIndex="1"
          placeholderText="Node debug port (e.g. 5858 or 9229)"
          value={this.state.port}
          onDidChange={port => this.setState({port})}
        />
      </div>
    );
  }

  _handleAttachButtonClick = async (): Promise<void> => {
    track('fb-node-debugger-attach-from-dialog');
    const port = Number(this.refs.port.getText().trim());
    const attachInfo = await getNodeAttachProcessInfo(
      this.props.targetUri,
      port,
    );

    const debuggerService = await getDebuggerService();
    debuggerService.startDebugging(attachInfo);

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      port: this.state.port,
    });
  };
}
