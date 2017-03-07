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
import {Button, ButtonTypes} from '../../nuclide-ui/Button';
import {Dropdown} from '../../nuclide-ui/Dropdown';
import {DebuggerLaunchAttachEventTypes} from '../../nuclide-debugger-base';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
import {track} from '../../nuclide-analytics';

import type EventEmitter from 'events';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {TargetEnvironment} from '../../nuclide-debugger-iwdp-rpc/lib/types';

type PropsType = {
  targetUri: NuclideUri,
  parentEmitter: EventEmitter,
};

type StateType = {
  selectedEnvironment: TargetEnvironment,
};

const TARGET_ENVIRONMENTS = [
  {label: 'iOS', value: 'iOS'},
  {label: 'Android', value: 'Android'},
];

export class AttachUiComponent extends React.Component<void, PropsType, StateType> {
  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);
    (this: any)._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    (this: any)._handleAttachButtonClick = this._handleAttachButtonClick.bind(this);
    (this: any)._handleDropdownChange = this._handleDropdownChange.bind(this);
    this.state = {
      selectedEnvironment: 'iOS',
    };
  }

  componentWillMount() {
    this.props.parentEmitter.on(
      DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED,
      this._handleAttachButtonClick,
    );
  }

  componentWillUnmount() {
    this.props.parentEmitter.removeListener(
      DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED,
      this._handleAttachButtonClick,
    );
  }

  render(): React.Element<any> {
    return (
      <div className="block">
        <div className="nuclide-debugger-php-launch-attach-ui-select-project">
          <label>Environment: </label>
          <Dropdown
            options={TARGET_ENVIRONMENTS}
            onChange={this._handleDropdownChange}
            value={this.state.selectedEnvironment}
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

  _handleDropdownChange(selectedEnvironment: TargetEnvironment): void {
    this.setState({
      selectedEnvironment,
    });
  }

  _handleAttachButtonClick(): void {
    track('nuclide-debugger-jsc-attach');
    const processInfo = new AttachProcessInfo(this.props.targetUri, this.state.selectedEnvironment);
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
