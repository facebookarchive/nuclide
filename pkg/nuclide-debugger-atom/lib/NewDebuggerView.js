'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  WatchExpression,
} from './WatchExpressionComponent';

import {
  React,
} from 'react-for-atom';
import {
  WatchExpressionComponent,
} from './WatchExpressionComponent';

type Props = {};

export class NewDebuggerView extends React.Component {
  props: Props;
  state: {
    watchExpressions: Array<WatchExpression>;
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      watchExpressions: [],
    };
    (this: any).handleUpdateExpressions = this.handleUpdateExpressions.bind(this);
  }

  handleUpdateExpressions(watchExpressions: Array<WatchExpression>): void {
    this.setState({
      watchExpressions,
    });
  }

  render(): React.Element {
    return (
      <div className="nuclide-debugger-container-new">
        <WatchExpressionComponent
          watchExpressions={this.state.watchExpressions}
          onUpdateExpressions={this.handleUpdateExpressions}
        />
      </div>
    );
  }
}
