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
  ExpansionResult,
} from './Bridge';
import {WatchExpressionStore} from './WatchExpressionStore';
import type {Local, Locals} from './LocalsStore';
import type {Observable} from 'rxjs';

import {
  React,
} from 'react-for-atom';
import {LazyNestedValueComponent} from '../../nuclide-ui/lib/LazyNestedValueComponent';
import SimpleValueComponent from '../../nuclide-ui/lib/SimpleValueComponent';

type LocalsComponentProps = {
  locals: Locals;
  watchExpressionStore: WatchExpressionStore;
};

export class LocalsComponent extends React.Component {
  props: LocalsComponentProps;

  constructor(props: LocalsComponentProps) {
    super(props);
    (this: any)._renderExpression = this._renderExpression.bind(this);
  }

  _renderExpression(
    fetchChildren: (objectId: string) => Observable<?ExpansionResult>,
    local: Local,
    index: number,
  ): React.Element<any> {
    const {
      name,
      value,
    } = local;
    return (
      <div
        className="nuclide-debugger-atom-watch-expression-row"
        key={index}>
        <div
          className="nuclide-debugger-atom-watch-expression-row-content">
          <LazyNestedValueComponent
            expression={name}
            evaluationResult={value}
            fetchChildren={fetchChildren}
            simpleValueComponent={SimpleValueComponent}
          />
        </div>
      </div>
    );
  }

  render(): ?React.Element<any> {
    const {
      watchExpressionStore,
      locals,
    } = this.props;
    if (locals == null || locals.length === 0) {
      return <span>(no variables)</span>;
    }
    const fetchChildren = watchExpressionStore.getProperties.bind(watchExpressionStore);
    const expressions = locals.map(this._renderExpression.bind(this, fetchChildren));
    return (
      <div>
        {expressions}
      </div>
    );
  }
}
