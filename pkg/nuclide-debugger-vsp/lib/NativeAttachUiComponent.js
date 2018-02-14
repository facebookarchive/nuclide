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
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import {track} from '../../nuclide-analytics';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {getDebuggerService} from '../../commons-atom/debugger';
import {getGdbAttachProcessInfo} from './utils';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

type Props = {|
  +targetUri: NuclideUri,
  +configIsValidChanged: (valid: boolean) => void,
|};

type State = {
  pid: string,
};

export default class NativeAttachUiComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;
  _pid: ?AtomInput;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      pid: '',
    };
  }

  _getSerializationArgs() {
    return [
      nuclideUri.isRemote(this.props.targetUri)
        ? nuclideUri.getHostname(this.props.targetUri)
        : 'local',
      'attach',
      'gdb',
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
          pid: savedSettings.pid || '',
        });
      },
    );

    if (this._pid != null) {
      this._pid.focus();
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
    const {pid} = this.state;
    return pid.length > 0 && !isNaN(pid);
  }

  render(): React.Node {
    return (
      <div className="block">
        <p>Attach to a running native process</p>
        <label>Process id: </label>
        <AtomInput
          ref={input => {
            this._pid = input;
          }}
          tabIndex="1"
          placeholderText="Running process id (for example, from 'ps')"
          value={this.state.pid}
          onDidChange={pid => this.setState({pid})}
        />
      </div>
    );
  }

  _handleAttachButtonClick = async (): Promise<void> => {
    track('fb-native-debugger-attach-from-dialog');
    const pid = Number(
      nullthrows(this._pid)
        .getText()
        .trim(),
    );
    const attachInfo = await getGdbAttachProcessInfo(this.props.targetUri, pid);

    const debuggerService = await getDebuggerService();
    debuggerService.startDebugging(attachInfo);

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      port: this.state.pid,
    });
  };
}
