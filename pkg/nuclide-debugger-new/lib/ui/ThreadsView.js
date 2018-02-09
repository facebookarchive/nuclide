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

import type {DebuggerModeType, IDebugService} from '../types';

import classnames from 'classnames';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as React from 'react';
import DebuggerThreadsComponent from './DebuggerThreadsComponent';
import {DebuggerMode} from '../constants';

type Props = {
  service: IDebugService,
};

export default class ThreadsView extends React.PureComponent<
  Props,
  {
    mode: DebuggerModeType,
  },
> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      mode: props.service.getDebuggerMode(),
    };
  }

  componentDidMount(): void {
    const {service} = this.props;
    this._disposables.add(
      service.onDidChangeMode(() => {
        this.setState({
          mode: service.getDebuggerMode(),
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
    const {service} = this.props;
    const {mode} = this.state;
    const disabledClass =
      mode !== DebuggerMode.RUNNING
        ? ''
        : ' nuclide-debugger-container-new-disabled';

    return (
      <div
        className={classnames('nuclide-debugger-container-new', disabledClass)}>
        <div className="nuclide-debugger-pane-content">
          <DebuggerThreadsComponent service={service} />
        </div>
      </div>
    );
  }
}
