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

import type {WatchExpressionStore} from './WatchExpressionStore';
import type {EvaluationResult} from './types';

import React from 'react';
import ReactDOM from 'react-dom';
import {LazyNestedValueComponent} from '../../nuclide-ui/LazyNestedValueComponent';
import SimpleValueComponent from '../../nuclide-ui/SimpleValueComponent';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import SelectableDiv from '../../nuclide-ui/SelectableDiv';

type DebuggerDatatipComponentProps = {
  expression: string,
  evaluationResult: EvaluationResult,
  watchExpressionStore: WatchExpressionStore,
};

export class DebuggerDatatipComponent extends React.Component {
  props: DebuggerDatatipComponentProps;
  _disposables: UniversalDisposable;

  componentDidMount(): void {
    const domNode: HTMLElement = (ReactDOM.findDOMNode(this): any);
    this._disposables = new UniversalDisposable(
      atom.commands.add(domNode, 'core:copy', event => {
        document.execCommand('copy');
        event.stopPropagation();
      }),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  render(): ?React.Element<any> {
    const {expression, evaluationResult, watchExpressionStore} = this.props;
    const fetchChildren = watchExpressionStore.getProperties.bind(
      watchExpressionStore,
    );
    return (
      <div className="nuclide-debugger-datatip">
        <span className="nuclide-debugger-datatip-value">
          <SelectableDiv>
            <LazyNestedValueComponent
              evaluationResult={evaluationResult}
              expression={expression}
              fetchChildren={fetchChildren}
              simpleValueComponent={SimpleValueComponent}
              expansionStateId={this}
            />
          </SelectableDiv>
        </span>
      </div>
    );
  }
}
