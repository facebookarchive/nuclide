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

import type DebuggerModel from './DebuggerModel';
import {CompositeDisposable} from 'atom';
import React from 'react';
import {Button} from 'nuclide-commons-ui/Button';
import {DebuggerSteppingComponent} from './DebuggerSteppingComponent';
import type {DebuggerModeType} from './types';
import {DebuggerMode} from './DebuggerStore';

type Props = {
  model: DebuggerModel,
};

export class DebuggerControlsView extends React.PureComponent {
  props: Props;
  state: {
    mode: DebuggerModeType,
  };
  _disposables: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new CompositeDisposable();
    const debuggerStore = props.model.getStore();
    this.state = {
      mode: debuggerStore.getDebuggerMode(),
    };
  }

  componentDidMount(): void {
    const debuggerStore = this.props.model.getStore();
    this._disposables.add(
      debuggerStore.onChange(() => {
        this.setState({
          mode: debuggerStore.getDebuggerMode(),
        });
      }),
    );
  }

  componentWillUnmount(): void {
    this._dispose();
  }

  _dispose(): void {
    this._disposables.dispose();
  }

  render(): React.Element<any> {
    const {model} = this.props;
    const actions = model.getActions();
    const {mode} = this.state;
    const debuggerStoppedNotice = mode !== DebuggerMode.STOPPED
      ? null
      : <div className="nuclide-debugger-pane-content">
          <div className="nuclide-debugger-state-notice">
            <span>The debugger is not attached.</span>
            <div className="nuclide-debugger-state-notice">
              <Button
                onClick={() =>
                  atom.commands.dispatch(
                    atom.views.getView(atom.workspace),
                    'nuclide-debugger:toggle',
                  )}>
                Start debugging
              </Button>
            </div>
          </div>
        </div>;

    const debugeeRunningNotice = mode !== DebuggerMode.RUNNING
      ? null
      : <div className="nuclide-debugger-pane-content">
          <div className="nuclide-debugger-state-notice">
            The debug target is currently running.
          </div>
        </div>;

    return (
      <div className="nuclide-debugger-container-new">
        <div className="nuclide-debugger-section-header nuclide-debugger-controls-section">
          <DebuggerSteppingComponent
            actions={actions}
            debuggerStore={model.getStore()}
          />
        </div>
        {debugeeRunningNotice}
        {debuggerStoppedNotice}
      </div>
    );
  }
}
