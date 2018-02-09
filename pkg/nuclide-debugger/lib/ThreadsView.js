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
import type {DebuggerModeType} from './types';
import {DebuggerMode} from './constants';

type Props = {
  model: DebuggerModel,
};

export class ThreadsView extends React.PureComponent<
  Props,
  {
    mode: DebuggerModeType,
    threadsComponentTitle: string,
  },
> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    const {model} = props;
    this.state = {
      mode: model.getDebuggerMode(),
      threadsComponentTitle: String(model.getSettings().threadsComponentTitle),
    };
  }

  componentDidMount(): void {
    const {model} = this.props;
    this._disposables.add(
      model.onChange(() => {
        this.setState({
          mode: model.getDebuggerMode(),
          threadsComponentTitle: model.getSettings().threadsComponentTitle,
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
    const {mode, threadsComponentTitle} = this.state;
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
            model={model}
            threadName={threadsComponentTitle}
          />
        </div>
      </div>
    );
  }
}
