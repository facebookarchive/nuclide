'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// TODO @jxg export debugger typedefs from main module. (t11406963)
import type {
  EvaluationResult,
} from '../../nuclide-debugger-atom/lib/Bridge';

import {React} from 'react-for-atom';
import {ValueComponentClassNames} from './ValueComponentClassNames';

type SimpleValueComponentProps = {
  expression: ?string;
  evaluationResult: EvaluationResult;
};

function renderNullish(evaluationResult: EvaluationResult): ?React.Element<any> {
  const {_type} = evaluationResult;
  return (
    _type === 'undefined' || _type === 'null'
      ? <span className={ValueComponentClassNames.nullish}>{_type}</span>
      : null
  );
}

function renderString(evaluationResult: EvaluationResult): ?React.Element<any> {
  const {
    _type,
    value,
  } = evaluationResult;
  return (
    _type === 'string'
      ? <span className={ValueComponentClassNames.string}>
          <span className={ValueComponentClassNames.stringOpeningQuote}>"</span>
          {value}
          <span className={ValueComponentClassNames.stringClosingQuote}>"</span>
        </span>
      : null
  );
}

function renderNumber(evaluationResult: EvaluationResult): ?React.Element<any> {
  const {
    _type,
    value,
  } = evaluationResult;
  return (
    _type === 'number'
      ? <span className={ValueComponentClassNames.number}>{value}</span>
      : null
  );
}

function renderDefault(evaluationResult: EvaluationResult): ?string {
  return evaluationResult.value;
}

const valueRenderers = [
  renderString,
  renderNumber,
  renderNullish,
  renderDefault,
];

export default class SimpleValueComponent extends React.Component {
  props: SimpleValueComponentProps;

  render(): ?React.Element<any> {
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
      displayValue = evaluationResult._description || '(N/A)';
    }
    if (expression == null) {
      return <span>{displayValue}</span>;
    }
    // TODO @jxg use a text editor to apply proper syntax highlighting for expressions
    // (t11408154)
    const renderedExpression = (
      <span className={ValueComponentClassNames.identifier}>
        {expression}
      </span>
    );
    return (
      <span>
        {renderedExpression}
        : {displayValue}
      </span>
    );
  }
}
