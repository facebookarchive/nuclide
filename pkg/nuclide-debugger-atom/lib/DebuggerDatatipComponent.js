'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {EvaluationResult} from './Bridge';

import {React} from 'react-for-atom';
import {DebuggerValueComponent} from './DebuggerValueComponent';

type DebuggerDatatipComponentProps = {
  expression: string;
  evaluationResult: EvaluationResult;
};

export class DebuggerDatatipComponent extends React.Component {
  props: DebuggerDatatipComponentProps;

  render(): ?React.Element {
    const {
      expression,
      evaluationResult,
    } = this.props;
    return (
      <div className="nuclide-debugger-datatip">
        {expression}:{' '}
        <span className="nuclide-debugger-datatip-value">
          <DebuggerValueComponent evaluationResult={evaluationResult} />
        </span>
      </div>
    );
  }
}
