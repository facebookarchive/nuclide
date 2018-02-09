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
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {ScopesComponent} from './ScopesComponent';
import type {DebuggerModeType} from './types';
import {DebuggerMode} from './constants';

type Props = {
  model: DebuggerModel,
};
type State = {
  mode: DebuggerModeType,
};

export class ScopesView extends React.PureComponent<Props, State> {
  _scopesComponentWrapped: React.ComponentType<any>;
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._scopesComponentWrapped = bindObservableAsProps(
      props.model.getScopes().map(scopes => ({scopes})),
      ScopesComponent,
    );
    this._disposables = new UniversalDisposable();
    this.state = {
      mode: props.model.getDebuggerMode(),
    };
  }

  componentDidMount(): void {
    const {model} = this.props;
    this._disposables.add(
      model.onChange(() => {
        this.setState({
          mode: model.getDebuggerMode(),
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
    const {mode} = this.state;
    const ScopesComponentWrapped = this._scopesComponentWrapped;
    const disabledClass =
      mode !== DebuggerMode.RUNNING
        ? ''
        : ' nuclide-debugger-container-new-disabled';

    return (
      <div
        className={classnames('nuclide-debugger-container-new', disabledClass)}>
        <div className="nuclide-debugger-pane-content">
          <ScopesComponentWrapped model={model} />
        </div>
      </div>
    );
  }
}
