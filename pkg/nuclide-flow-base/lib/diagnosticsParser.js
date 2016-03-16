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

// Types for the old `flow status` output -- v0.22 and below

type OldFlowStatusOutput = {
  passed: boolean;
  // This is not actually the Flow version; instead it is a build ID or something.
  version?: string;
  errors: Array<OldFlowStatusError>;
};

type OldFlowStatusError = {
  kind: string;
  operation?: OldFlowStatusErrorOperation;
  message: Array<OldFlowStatusErrorMessageComponent>;
};

type OldBaseFlowStatusErrorMessageComponent = {
  // If there is no path component, this is the empty string. We should make it null instead, in
  // that case (t8644340)
  path: string;
  descr: string;
  line: number;
  start: number;
  end: number;
  endline: number;
}

type OldFlowStatusErrorMessageComponent = OldBaseFlowStatusErrorMessageComponent & {
  level: 'error' | 'warning';
};

// Same as FlowStatusErrorMessageComponent, except without the 'level' field.
type OldFlowStatusErrorOperation = OldBaseFlowStatusErrorMessageComponent;

// New types for `flow status` v0.23.0 (or possibly v0.24.0, it has yet to be finalized)

type NewFlowStatusOutput = {
  passed: boolean;
  flowVersion: string;
  errors: Array<NewFlowStatusError>;
};

type NewFlowStatusError = {
  level: 'error' | 'warning';
  // e.g. parse, infer, maybe others?
  kind: string;
  message: Array<NewFlowStatusErrorMessageComponent>;
  operation?: NewFlowStatusErrorMessageComponent;

  // There is also an `extra` field where additional details about certain kinds of errors are
  // provided. For now we will ignore these details.
};

type NewFlowStatusErrorMessageComponent = {
  descr: string;
  loc?: FlowLoc;
  // The old path, line, etc. fields also currently exist here, but they are deprecated in favor of
  // `loc`.
};

type FlowLoc = {
  // file path
  source: string;
  start: FlowPoint;
  end: FlowPoint;
}

type FlowPoint = {
  column: number;
  line: number;
  // total character offset
  offset: number;
};

export function flowStatusOutputToDiagnostics(
  root: string,
  statusOutput: Object,
): Diagnostics {
  if (statusOutput['flowVersion'] != null) {
    return newFlowStatusOutputToDiagnostics(root, statusOutput);
  } else {
    return oldFlowStatusOutputToDiagnostics(root, statusOutput);
  }
}

export function oldFlowStatusOutputToDiagnostics(
  root: string,
  statusOutput: OldFlowStatusOutput,
): Diagnostics {
  const errors: Array<OldFlowStatusError> = statusOutput['errors'];
  const messages: Array<Diagnostic> = errors.map((flowStatusError: OldFlowStatusError) => {
    const flowMessageComponents: Array<OldFlowStatusErrorMessageComponent> =
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
  component: OldBaseFlowStatusErrorMessageComponent,
): MessageComponent {
  const path = component.path;
  let range = null;

  // Flow returns the empty string instead of null when there is no relevant path. The upcoming
  // format changes described elsewhere in this file fix the issue, but for now we must still work
  // around it.
  if (path != null && path !== '') {
    range = {
      file: path,
      start: {
        line: component.line,
        column: component.start,
      },
      end: {
        line: component.endline,
        column: component.end,
      },
    };
  }
  return {
    descr: component.descr,
    range,
  };
}

export function newFlowStatusOutputToDiagnostics(
  root: string,
  statusOutput: NewFlowStatusOutput,
): Diagnostics {
  const errors: Array<NewFlowStatusError> = statusOutput.errors;
  const messages: Array<Diagnostic> = errors.map((flowStatusError: NewFlowStatusError) => {
    const flowMessageComponents: Array<NewFlowStatusErrorMessageComponent> =
      flowStatusError.message;
    const level = flowStatusError.level;

    const messageComponents: Array<MessageComponent> =
      flowMessageComponents.map(newFlowMessageComponentToMessageComponent);
    const operation = flowStatusError.operation;
    if (operation != null) {
      const operationComponent = newFlowMessageComponentToMessageComponent(operation);
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
    messages,
  };
}

function newFlowMessageComponentToMessageComponent(
  component: NewFlowStatusErrorMessageComponent,
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
