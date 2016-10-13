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
  Diagnostics,
  Diagnostic,
  MessageComponent,
  Range,
} from '..';

import type {
  FlowStatusOutput,
  FlowStatusError,
  FlowStatusErrorMessageComponent,
  FlowLoc,
} from './flowOutputTypes';

export function flowStatusOutputToDiagnostics(
  root: string,
  statusOutput: FlowStatusOutput,
): Diagnostics {
  const errors: Array<FlowStatusError> = statusOutput.errors;
  const messages: Array<Diagnostic> = errors.map((flowStatusError: FlowStatusError) => {
    const flowMessageComponents: Array<FlowStatusErrorMessageComponent> =
      flowStatusError.message;
    const level = flowStatusError.level;

    const messageComponents: Array<MessageComponent> =
      flowMessageComponents.map(flowMessageComponentToMessageComponent);
    const operation = flowStatusError.operation;
    if (operation != null) {
      const operationComponent = flowMessageComponentToMessageComponent(operation);
      operationComponent.descr = 'See also: ' + operationComponent.descr;
      messageComponents.push(operationComponent);
    }
    const extra = flowStatusError.extra;
    if (extra != null) {
      const flatExtra = [].concat(...extra.map(({message}) => message));
      messageComponents.push(...flatExtra.map(flowMessageComponentToMessageComponent));
    }

    return {
      level,
      messageComponents,
    };
  });

  return {
    flowRoot: root,
    messages,
  };
}

function flowMessageComponentToMessageComponent(
  component: FlowStatusErrorMessageComponent,
): MessageComponent {
  return {
    descr: component.descr,
    range: maybeFlowLocToRange(component.loc),
  };
}

function maybeFlowLocToRange(loc: ?FlowLoc): ?Range {
  return loc == null ? null : flowLocToRange(loc);
}

function flowLocToRange(loc: FlowLoc): Range {
  return {
    file: loc.source,
    start: {
      line: loc.start.line,
      column: loc.start.column,
    },
    end: {
      line: loc.end.line,
      column: loc.end.column,
    },
  };
}
