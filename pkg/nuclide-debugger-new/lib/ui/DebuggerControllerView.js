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

import type {IDebugService} from '../types';

import * as React from 'react';
import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {DebuggerMode} from '../constants';

type Props = {
  service: IDebugService,
};

export default class DebuggerControllerView extends React.Component<Props> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
  }

  componentDidMount() {
    this._disposables.add(
      this.props.service.onDidChangeMode(() => this.forceUpdate()),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  render(): React.Node {
    if (this.props.service.getDebuggerMode() === DebuggerMode.STARTING) {
      return (
        <div className="nuclide-debugger-starting-message">
          <div>
            <span className="inline-block">Starting Debugger...</span>
            <LoadingSpinner className="inline-block" size="EXTRA_SMALL" />
          </div>
        </div>
      );
    }
    return null;
  }
}
