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
import type {DebuggerModeType} from './types';

import classnames from 'classnames';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as React from 'react';
import {DebuggerCallstackComponent} from './DebuggerCallstackComponent';
import {DebuggerMode} from './constants';

type Props = {
  model: DebuggerModel,
};

export class CallstackView extends React.PureComponent<
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
      mode: props.model.getDebuggerMode(),
    };
  }

  componentDidMount(): void {
    this._disposables.add(
      this.props.model.onChange(() => {
        this.setState({
          mode: this.props.model.getDebuggerMode(),
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
    const actions = model.getActions();
    const {mode} = this.state;
    const disabledClass =
      mode !== DebuggerMode.RUNNING
        ? ''
        : ' nuclide-debugger-container-new-disabled';

    return (
      <div
        className={classnames('nuclide-debugger-container-new', disabledClass)}>
        <div className="nuclide-debugger-pane-content">
          <DebuggerCallstackComponent actions={actions} model={model} />
        </div>
      </div>
    );
  }
}
