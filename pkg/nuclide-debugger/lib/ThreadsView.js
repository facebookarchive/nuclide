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

import classnames from 'classnames';
import type DebuggerModel from './DebuggerModel';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as React from 'react';
import {DebuggerThreadsComponent} from './DebuggerThreadsComponent';
import type {ThreadColumn} from 'nuclide-debugger-common';
import type {DebuggerModeType} from './types';
import {DebuggerMode} from './constants';

type Props = {
  model: DebuggerModel,
};

export class ThreadsView extends React.PureComponent<
  Props,
  {
    customThreadColumns: Array<ThreadColumn>,
    mode: DebuggerModeType,
    threadsComponentTitle: string,
  },
> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    const debuggerStore = props.model.getStore();
    this.state = {
      customThreadColumns: debuggerStore.getSettings().customThreadColumns,
      mode: debuggerStore.getDebuggerMode(),
      threadsComponentTitle: String(
        debuggerStore.getSettings().threadsComponentTitle,
      ),
    };
  }

  componentDidMount(): void {
    const debuggerStore = this.props.model.getStore();
    this._disposables.add(
      debuggerStore.onChange(() => {
        this.setState({
          customThreadColumns: debuggerStore.getSettings().customThreadColumns,
          mode: debuggerStore.getDebuggerMode(),
          threadsComponentTitle: debuggerStore.getSettings()
            .threadsComponentTitle,
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

  render(): React.Node {
    const {model} = this.props;
    const {mode, threadsComponentTitle, customThreadColumns} = this.state;
    const disabledClass =
      mode !== DebuggerMode.RUNNING
        ? ''
        : ' nuclide-debugger-container-new-disabled';

    const selectThread = model.selectThread.bind(model);

    return (
      <div
        className={classnames('nuclide-debugger-container-new', disabledClass)}>
        <div className="nuclide-debugger-pane-content">
          <DebuggerThreadsComponent
            selectThread={selectThread}
            threadStore={model.getThreadStore()}
            customThreadColumns={customThreadColumns}
            threadName={threadsComponentTitle}
          />
        </div>
      </div>
    );
  }
}
