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

import type {EvaluationResult} from 'nuclide-commons-ui/TextRenderer';

import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';
import * as React from 'react';
import {LazyNestedValueComponent} from 'nuclide-commons-ui/LazyNestedValueComponent';
import SimpleValueComponent from 'nuclide-commons-ui/SimpleValueComponent';
import {fetchChildrenForLazyComponent} from '../utils';

type Props = {|
  +expression: string,
  +evaluationResult: ?EvaluationResult,
|};

export default class DebuggerDatatipComponent extends React.Component<Props> {
  render(): React.Node {
    const {expression, evaluationResult} = this.props;
    let datatipElement;
    if (evaluationResult == null) {
      datatipElement = <LoadingSpinner delay={100} size="EXTRA_SMALL" />;
    } else {
      datatipElement = (
        <span className="nuclide-debugger-datatip-value">
          <LazyNestedValueComponent
            evaluationResult={evaluationResult}
            expression={expression}
            fetchChildren={(fetchChildrenForLazyComponent: any)}
            simpleValueComponent={SimpleValueComponent}
            expansionStateId={this}
          />
        </span>
      );
    }
    return <div className="nuclide-debugger-datatip">{datatipElement}</div>;
  }
}
