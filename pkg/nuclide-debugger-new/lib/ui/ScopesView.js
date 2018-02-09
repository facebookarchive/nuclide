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

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as React from 'react';
import classnames from 'classnames';
import ScopesComponent from './ScopesComponent';
import {DebuggerMode} from '../constants';

type Props = {
  service: IDebugService,
};
type State = {
  mode: DebuggerModeType,
};

export default class ScopesView extends React.PureComponent<Props, State> {
  _scopesComponentWrapped: React.ComponentType<any>;
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
          <ScopesComponent service={service} />
        </div>
      </div>
    );
  }
}
