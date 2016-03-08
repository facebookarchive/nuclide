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
} from './FlowService';

type FlowStatusOutput = {
  passed: boolean;
  version?: string;
  errors: Array<FlowStatusError>;
};

type FlowStatusError = {
  kind: string;
  operation?: FlowStatusErrorOperation;
  message: Array<FlowStatusErrorMessageComponent>;
};

type BaseFlowStatusErrorMessageComponent = {
  // If there is no path component, this is the empty string. We should make it null instead, in
  // that case (t8644340)
  path: string;
  descr: string;
  line: number;
  start: number;
  end: number;
  endline: number;
}

type FlowStatusErrorMessageComponent = BaseFlowStatusErrorMessageComponent & {
  level: 'error' | 'warning';
};

// Same as FlowStatusErrorMessageComponent, except without the 'level' field.
type FlowStatusErrorOperation = BaseFlowStatusErrorMessageComponent;

export function flowStatusOutputToDiagnostics(
  root: string,
  statusOutput: FlowStatusOutput,
): Diagnostics {
  const errors: Array<FlowStatusError> = statusOutput['errors'];
  const messages: Array<Diagnostic> = errors.map((flowStatusError: FlowStatusError) => {
    const flowMessageComponents: Array<FlowStatusErrorMessageComponent> =
      flowStatusError['message'];
    const level = flowMessageComponents[0]['level'];

    const messageComponents: Array<MessageComponent> =
      flowMessageComponents.map(flowMessageComponentToMessageComponent);
    const operation = flowStatusError['operation'];
    if (operation != null) {
      // The operation field provides additional context. I don't fully understand the motivation
      // behind separating it out, but prepending it with 'See also: ' and adding it to the end of
      // the messages is what the Flow team recommended.
      const operationComponent = flowMessageComponentToMessageComponent(operation);
      operationComponent.descr = 'See also: ' + operationComponent.descr;
      messageComponents.push(operationComponent);
    }
    return {
      level,
      messageComponents,
    };
  });

  return {
    flowRoot: root,
    messages: messages,
  };
}

function flowMessageComponentToMessageComponent(
  component: BaseFlowStatusErrorMessageComponent,
): MessageComponent {
  let path = component['path'];
  if (path == null || path === '') {
    // Use a consistent 'falsy' value for the empty string, undefined, etc. Flow returns the
    // empty string instead of null when there is no relevant path.
    // TODO(t8644340) Remove this when Flow is fixed.
    path = undefined;
  }
  return {
    path,
    descr: component['descr'],
    line: component['line'],
    endline: component['endline'],
    start: component['start'],
    end: component['end'],
  };
}
