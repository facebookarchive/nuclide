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
import invariant from 'assert';

type DebuggerValueComponentProps = {
  evaluationResult: ?EvaluationResult;
};

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

export class DebuggerValueComponent extends React.Component {
  props: DebuggerValueComponentProps;

  render(): ?React.Element {
    const {
      evaluationResult,
    } = this.props;
    let displayValue;
    if (evaluationResult == null) {
      displayValue = '<not available>';
    } else {
      if (!displayValue) {
        for (const renderer of valueRenderers) {
          invariant(evaluationResult);
          displayValue = renderer(evaluationResult);
          if (displayValue != null) {
            break;
          }
        }
      }
      if (displayValue == null || displayValue === '') {
        displayValue = '(N/A)';
      }
    }
    return (
      <span>
        {displayValue}
      </span>
    );
  }
}
