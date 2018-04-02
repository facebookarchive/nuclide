/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {DebuggerModeType, IDebugService} from '../types';

import {observableFromSubscribeFunction} from 'nuclide-commons/event';
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
      observableFromSubscribeFunction(
        service.onDidChangeMode.bind(service),
      ).subscribe(mode => this.setState({mode})),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  render(): React.Node {
    const {service} = this.props;
    const {mode} = this.state;
    const disabledClass =
      mode !== DebuggerMode.RUNNING ? '' : ' debugger-container-new-disabled';

    return (
      <div className={classnames('debugger-container-new', disabledClass)}>
        <div className="debugger-pane-content">
          <ScopesComponent service={service} />
        </div>
      </div>
    );
  }
}
