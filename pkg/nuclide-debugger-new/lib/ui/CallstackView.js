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
import DebuggerCallstackComponent from './DebuggerCallstackComponent';
import {DebuggerMode} from '../constants';

type Props = {
  service: IDebugService,
};

type State = {
  mode: DebuggerModeType,
};

export default class CallstackView extends React.PureComponent<Props, State> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      mode: props.service.getDebuggerMode(),
    };
  }

  componentDidMount(): void {
    this._disposables.add(
      this.props.service.onDidChangeMode(() => {
        this.setState({
          mode: this.props.service.getDebuggerMode(),
        });
      }),
    );
  }

  componentWillUnmount(): void {
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
          <DebuggerCallstackComponent service={service} />
        </div>
      </div>
    );
  }
}
