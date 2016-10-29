'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import {AttachProcessInfo} from './AttachProcessInfo';
import {Button, ButtonTypes} from '../../nuclide-ui/Button';
import {DebuggerLaunchAttachEventTypes} from '../../nuclide-debugger-base';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
import {track} from '../../nuclide-analytics';

import type EventEmitter from 'events';
import type {NuclideUri} from '../../commons-node/nuclideUri';

type PropsType = {
  targetUri: NuclideUri,
  parentEmitter: EventEmitter,
};

type StateType = {
  selectedPathIndex: number,
  pathMenuItems: Array<{label: string, value: number}>,
};

export class AttachUiComponent extends React.Component<void, PropsType, StateType> {
  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);
    (this: any)._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    (this: any)._handleAttachButtonClick = this._handleAttachButtonClick.bind(this);
    (this: any)._handlePathsDropdownChange = this._handlePathsDropdownChange.bind(this);
    this.state = {
      selectedPathIndex: 0,
      pathMenuItems: this._getPathMenuItems(),
    };
  }

  componentWillMount() {
    this.props.parentEmitter.on(
      DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED,
      this._handleAttachButtonClick);
  }

  componentWillUnmount() {
    this.props.parentEmitter.removeListener(
      DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED,
      this._handleAttachButtonClick);
  }

  render(): React.Element<any> {
    return (
      <div className="block">
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

  _getPathMenuItems(): Array<{label: string, value: number}> {
    return [];
  }

  _handlePathsDropdownChange(newIndex: number): void {
    this.setState({
      selectedPathIndex: newIndex,
      pathMenuItems: this._getPathMenuItems(),
    });
  }

  _handleAttachButtonClick(): void {
    track('nuclide-debugger-jsc-attach');
    const processInfo = new AttachProcessInfo(this.props.targetUri);
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
