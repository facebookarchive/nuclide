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

function renderObject(evaluationResult: EvaluationResult): ?string {
  const {
    _type,
    _description,
  } = evaluationResult;
  return (
    _type === 'object'
      ? _description
      : null
  );
}

function renderNullish(evaluationResult: EvaluationResult): ?string {
  const {_type} = evaluationResult;
  return (
    _type === 'undefined' || _type === 'null'
      ? _type
      : null
  );
}

function renderString(evaluationResult: EvaluationResult): ?string {
  const {
    _type,
    value,
  } = evaluationResult;
  return (
    _type === 'string'
      ? `"${value}"`
      : null
  );
}

function renderDefault(evaluationResult: EvaluationResult): ?string {
  return evaluationResult.value;
}

const valueRenderers = [
  renderObject,
  renderString,
  renderNullish,
  renderDefault,
];

export class DebuggerDatatipComponent extends React.Component {
  props: DebuggerDatatipComponentProps;

  render(): ReactElement {
    const {
      expression,
      evaluationResult,
    } = this.props;
    let displayValue;
    for (const renderer of valueRenderers) {
      displayValue = renderer(evaluationResult);
      if (displayValue != null) {
        break;
      }
    }
    if (displayValue == null || displayValue === '') {
      displayValue = '(N/A)';
    }
    return (
      <div className="nuclide-debugger-datatip">
        {expression}:{' '}
        <span className="nuclide-debugger-datatip-value">{displayValue}</span>
      </div>
    );
  }
}
