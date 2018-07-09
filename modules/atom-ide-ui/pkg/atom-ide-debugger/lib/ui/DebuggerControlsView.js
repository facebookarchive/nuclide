/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {DebuggerModeType, IDebugService} from '../types';

import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as React from 'react';
import TruncatedButton from 'nuclide-commons-ui/TruncatedButton';
import DebuggerSteppingComponent from './DebuggerSteppingComponent';
import {DebuggerMode} from '../constants';
import DebuggerControllerView from './DebuggerControllerView';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';

const DEVICE_PANEL_URL = 'atom://nuclide/devices';

type Props = {
  service: IDebugService,
  passesMultiGK: boolean,
};

type State = {
  mode: DebuggerModeType,
  hasDevicePanelService: boolean,
};

export default class DebuggerControlsView extends React.PureComponent<
  Props,
  State,
> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);

    this._disposables = new UniversalDisposable();
    this.state = {
      mode: props.service.getDebuggerMode(),
      hasDevicePanelService: false,
    };
  }

  componentDidMount(): void {
    const {service} = this.props;
    this._disposables.add(
      observableFromSubscribeFunction(
        service.onDidChangeMode.bind(service),
      ).subscribe(mode => this.setState({mode})),
      atom.packages.serviceHub.consume('nuclide.devices', '0.0.0', provider =>
        this.setState({
          hasDevicePanelService: true,
        }),
      ),
    );
  }

  componentWillUnmount(): void {
    this._dispose();
  }

  _dispose(): void {
    this._disposables.dispose();
  }

  render(): React.Node {
    const {service, passesMultiGK} = this.props;
    const {mode} = this.state;
    const debuggerStoppedNotice =
      mode !== DebuggerMode.STOPPED ? null : (
        <div className="debugger-pane-content">
          <div className="debugger-state-notice">
            <span>The debugger is not attached.</span>
          </div>
        </div>
      );

    const debuggerRunningNotice =
      mode !== DebuggerMode.RUNNING ? null : (
        <div className="debugger-pane-content">
          <div className="debugger-state-notice">
            {(service.viewModel.focusedProcess == null ||
            service.viewModel.focusedProcess.configuration.processName == null
              ? 'The debug target'
              : service.viewModel.focusedProcess.configuration.processName) +
              ' is currently running.'}
          </div>
        </div>
      );

    const debuggerNotice =
      mode !== DebuggerMode.STOPPED && !passesMultiGK ? null : (
        <div className="padded">
          <TruncatedButton
            onClick={() =>
              atom.commands.dispatch(
                atom.views.getView(atom.workspace),
                'debugger:show-attach-dialog',
              )
            }
            icon="nuclicon-debugger"
            label="Attach debugger..."
          />
          <TruncatedButton
            onClick={() =>
              atom.commands.dispatch(
                atom.views.getView(atom.workspace),
                'debugger:show-launch-dialog',
              )
            }
            icon="nuclicon-debugger"
            label="Launch debugger..."
          />
          {this.state.hasDevicePanelService ? (
            <TruncatedButton
              onClick={() => goToLocation(DEVICE_PANEL_URL)}
              icon="device-mobile"
              label="Manage devices..."
            />
          ) : null}
        </div>
      );

    return (
      <div className="debugger-container-new">
        <div className="debugger-section-header">
          <DebuggerControllerView service={service} />
        </div>
        <div className="debugger-section-header debugger-controls-section">
          <DebuggerSteppingComponent service={service} />
        </div>
        {debuggerRunningNotice}
        {debuggerStoppedNotice}
        {debuggerNotice}
      </div>
    );
  }
}
