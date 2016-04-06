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

type DebuggerDatatipComponentProps = {
  expression: string;
  evaluationResult: EvaluationResult;
}

export class DebuggerDatatipComponent extends React.Component {
  props: DebuggerDatatipComponentProps;

  render(): ReactElement {
    const {
      expression,
      evaluationResult,
    } = this.props;
    const {
      _type: resultType,
      value,
      _description: description,
    } = evaluationResult;
    const displayValue = resultType === 'object' ? description : value;
    return <div>{expression} = {displayValue}</div>;
  }
}
