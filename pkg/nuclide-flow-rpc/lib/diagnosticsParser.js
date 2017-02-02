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
  const diagnosticMessages: Array<FileDiagnosticMessage> =
      errors.map(flowMessageToDiagnosticMessage);

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
export function diagnosticToFix(diagnostic: FileDiagnosticMessage): ?Fix {
  for (const extractionFunction of fixExtractionFunctions) {
    const fix = extractionFunction(diagnostic);
    if (fix != null) {
      return fix;
    }
  }

  return null;
}

const fixExtractionFunctions: Array<(diagnostic: FileDiagnosticMessage) => ?Fix> = [
  unusedSuppressionFix,
  namedImportTypo,
];

function unusedSuppressionFix(diagnostic: FileDiagnosticMessage): ?Fix {
  // Automatically remove unused suppressions:
  if (diagnostic.trace != null &&
      diagnostic.trace.length === 1 &&
      diagnostic.text === 'Error suppressing comment' &&
      diagnostic.trace[0].text === 'Unused suppression') {
    const oldRange = diagnostic.range;
    invariant(oldRange != null);
    return {
      newText: '',
      oldRange,
      speculative: true,
    };
  }

  return null;
}

function namedImportTypo(diagnostic: FileDiagnosticMessage): ?Fix {
  const trace = diagnostic.trace;
  const text = diagnostic.text;
  if (trace == null || trace.length !== 1 || text == null) {
    return null;
  }
  const traceText = trace[0].text;
  if (traceText == null) {
    return null;
  }

  if (!/^Named import from module `[^`]*`$/.test(text)) {
    return null;
  }

  const regex = /^This module has no named export called `([^`]*)`. Did you mean `([^`]*)`\?$/;
  const match = regex.exec(traceText);
  if (match == null) {
    return null;
  }

  const oldText = match[1];
  const newText = match[2];
  const oldRange = diagnostic.range;
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

function flowMessageToDiagnosticMessage(flowStatusError: FlowStatusError) {
  const flowMessageComponents: Array<FlowStatusErrorMessageComponent> =
    flowStatusError.message;

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

  const flowMessage = messageComponents[0];

  // The Flow type does not capture this, but the first message always has a path, and the
  // diagnostics package requires a FileDiagnosticMessage to have a path.
  const path = extractPath(flowMessage);
  invariant(path != null, 'Expected path to not be null or undefined');

  const diagnosticMessage: FileDiagnosticMessage = {
    scope: 'file',
    providerName: 'Flow',
    type: flowStatusError.level === 'error' ? 'Error' : 'Warning',
    text: flowMessage.descr,
    filePath: path,
    range: extractRange(flowMessage),
  };

  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (messageComponents.length > 1) {
    diagnosticMessage.trace = messageComponents.slice(1).map(flowMessageToTrace);
  }

  const fix = diagnosticToFix(diagnosticMessage);
  if (fix != null) {
    diagnosticMessage.fix = fix;
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
