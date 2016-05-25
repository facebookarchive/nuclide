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
  EvaluationResult,
  ExpansionResult,
} from './Bridge';
import type {Observable} from 'rxjs';

import {React} from 'react-for-atom';
import {highlightOnUpdate} from '../../nuclide-ui/lib/highlightOnUpdate';
import SimpleValueComponent from './SimpleValueComponent';

type DebuggerValueComponentProps = {
  evaluationResult: ?EvaluationResult;
  expression: string;
  fetchChildren: (objectId: string) => Observable<?ExpansionResult>;
};

const NOT_AVAILABLE_MESSAGE = '<not available>';

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

function isObjectValue(result: EvaluationResult): boolean {
  return result._objectId != null;
}

// TODO allow passing action components (edit button, pin button) here
function renderValueLine(
  expression: React.Element | string,
  value: React.Element | string,
): React.Element {
  return <div>{expression}: {value}</div>;
}

class ValueComponent extends React.Component {
  // $FlowIssue HOC
  props: DebuggerValueComponentProps;

  render(): ?React.Element {
    const {
      evaluationResult,
      expression,
    } = this.props;
    if (evaluationResult == null) {
      return renderValueLine(expression, NOT_AVAILABLE_MESSAGE);
    }
    if (!isObjectValue(evaluationResult)) {
      return (
        <SimpleValueComponent
          expression={expression}
          evaluationResult={evaluationResult}
        />
      );
    }
    return (
      <span>
        {renderObject}
      </span>
    );
  }
}

function arePropsEqual(p1: DebuggerValueComponentProps, p2: DebuggerValueComponentProps): boolean {
  const evaluationResult1 = p1.evaluationResult;
  const evaluationResult2 = p2.evaluationResult;
  if (evaluationResult1 === evaluationResult2) {
    return true;
  }
  if (evaluationResult1 == null || evaluationResult2 == null) {
    return false;
  }
  return (
    evaluationResult1.value === evaluationResult2.value &&
    evaluationResult1._type === evaluationResult2._type &&
    evaluationResult1._description === evaluationResult2._description
  );
}
export const DebuggerValueComponent = highlightOnUpdate(
  ValueComponent,
  arePropsEqual,
  undefined, /* custom classname */
  undefined, /* custom delay */
);
