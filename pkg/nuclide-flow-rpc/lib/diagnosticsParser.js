/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  Diagnostics,
  Diagnostic,
  MessageComponent,
  RangeInFile,
} from '..';

import type {
  FlowStatusOutput,
  FlowStatusError,
  FlowStatusErrorMessageComponent,
  FlowLoc,
} from './flowOutputTypes';

import {Range} from 'simple-text-buffer';

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
    rangeInFile: maybeFlowLocToRange(component.loc),
  };
}

function maybeFlowLocToRange(loc: ?FlowLoc): ?RangeInFile {
  return loc == null ? null : flowLocToRange(loc);
}

function flowLocToRange(loc: FlowLoc): RangeInFile {
  return {
    file: loc.source,
    range: new Range(
      [
        loc.start.line,
        loc.start.column,
      ],
      [
        loc.end.line,
        loc.end.column,
      ],
    ),
  };
}
