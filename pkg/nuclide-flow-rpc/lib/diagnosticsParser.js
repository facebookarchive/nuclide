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
  FileDiagnosticMessage,
  Trace,
  Fix,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import type {
  NewDiagnostics,
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

import invariant from 'assert';
import {Range} from 'simple-text-buffer';

export function flowStatusOutputToDiagnostics(
  root: string,
  statusOutput: FlowStatusOutput,
): NewDiagnostics {
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

  const diagnosticMessages: Array<FileDiagnosticMessage> =
      messages.map(flowMessageToDiagnosticMessage);

  return {
    flowRoot: root,
    messages: diagnosticMessages,
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

// Exported for testing
export function flowMessageToFix(diagnostic: Diagnostic): ?Fix {
  for (const extractionFunction of fixExtractionFunctions) {
    const fix = extractionFunction(diagnostic);
    if (fix != null) {
      return fix;
    }
  }

  return null;
}

const fixExtractionFunctions: Array<(diagnostic: Diagnostic) => ?Fix> = [
  unusedSuppressionFix,
  namedImportTypo,
];

function unusedSuppressionFix(diagnostic: Diagnostic): ?Fix {
  // Automatically remove unused suppressions:
  if (diagnostic.messageComponents.length === 2 &&
      diagnostic.messageComponents[0].descr === 'Error suppressing comment' &&
      diagnostic.messageComponents[1].descr === 'Unused suppression') {
    const oldRange = extractRange(diagnostic.messageComponents[0]);
    invariant(oldRange != null);
    return {
      newText: '',
      oldRange,
      speculative: true,
    };
  }

  return null;
}

function namedImportTypo(diagnostic: Diagnostic): ?Fix {
  if (diagnostic.messageComponents.length !== 2) {
    return null;
  }

  const firstComponent = diagnostic.messageComponents[0];
  const secondComponent = diagnostic.messageComponents[1];
  if (!/^Named import from module `[^`]*`$/.test(firstComponent.descr)) {
    return null;
  }

  const regex = /^This module has no named export called `([^`]*)`. Did you mean `([^`]*)`\?$/;
  const match = regex.exec(secondComponent.descr);
  if (match == null) {
    return null;
  }

  const oldText = match[1];
  const newText = match[2];
  const oldRange = extractRange(diagnostic.messageComponents[0]);
  invariant(oldRange != null);

  return {
    oldText,
    newText,
    oldRange,
    speculative: true,
  };
}

/**
 * Currently, a diagnostic from Flow is an object with a "message" property.
 * Each item in the "message" array is an object with the following fields:
 *     - path (string) File that contains the error.
 *     - descr (string) Description of the error.
 *     - line (number) Start line.
 *     - endline (number) End line.
 *     - start (number) Start column.
 *     - end (number) End column.
 *     - code (number) Presumably an error code.
 * The message array may have more than one item. For example, if there is a
 * type incompatibility error, the first item in the message array blames the
 * usage of the wrong type and the second blames the declaration of the type
 * with which the usage disagrees. Note that these could occur in different
 * files.
 */

function extractPath(message: MessageComponent): NuclideUri | void {
  return message.rangeInFile == null ? undefined : message.rangeInFile.file;
}

// A trace object is very similar to an error object.
function flowMessageToTrace(message: MessageComponent): Trace {
  return {
    type: 'Trace',
    text: message.descr,
    filePath: extractPath(message),
    range: extractRange(message),
  };
}

function flowMessageToDiagnosticMessage(diagnostic: Diagnostic) {
  const flowMessage = diagnostic.messageComponents[0];

  // The Flow type does not capture this, but the first message always has a path, and the
  // diagnostics package requires a FileDiagnosticMessage to have a path.
  const path = extractPath(flowMessage);
  invariant(path != null, 'Expected path to not be null or undefined');

  const diagnosticMessage: FileDiagnosticMessage = {
    scope: 'file',
    providerName: 'Flow',
    type: diagnostic.level === 'error' ? 'Error' : 'Warning',
    text: flowMessage.descr,
    filePath: path,
    range: extractRange(flowMessage),
  };

  const fix = flowMessageToFix(diagnostic);
  if (fix != null) {
    diagnosticMessage.fix = fix;
  }

  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (diagnostic.messageComponents.length > 1) {
    diagnosticMessage.trace = diagnostic.messageComponents.slice(1).map(flowMessageToTrace);
  }

  return diagnosticMessage;
}

// Use `atom$Range | void` rather than `?atom$Range` to exclude `null`, so that the type is
// compatible with the `range` property, which is an optional property rather than a nullable
// property.
export function extractRange(message: MessageComponent): atom$Range | void {
  // It's unclear why the 1-based to 0-based indexing works the way that it
  // does, but this has the desired effect in the UI, in practice.
  const {rangeInFile} = message;
  if (rangeInFile == null) {
    return undefined;
  } else {
    return new Range(
      [rangeInFile.range.start.row - 1, rangeInFile.range.start.column - 1],
      [rangeInFile.range.end.row - 1, rangeInFile.range.end.column],
    );
  }
}
