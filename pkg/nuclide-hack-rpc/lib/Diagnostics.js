'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {
  FileDiagnosticMessage,
  DiagnosticProviderUpdate,
} from '../../nuclide-diagnostics-common/lib/rpc-types';

import {Range} from 'simple-text-buffer';
import invariant from 'assert';

export type HackDiagnosticsResult = {
  errors: Array<{
    message: HackDiagnostic,
  }>,
};

/**
 * Each error or warning can consist of any number of different messages from
 * Flow to help explain the problem and point to different locations that may be
 * of interest.
 */
export type HackDiagnostic = Array<SingleHackMessage>;

export type SingleHackMessage = {
  path: ?NuclideUri,
  descr: string,
  code: number,
  line: number,
  start: number,
  end: number,
};


/**
 * Currently, a diagnostic from Hack is an object with a "message" property.
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
function extractRange(message: SingleHackMessage): atom$Range {
  // It's unclear why the 1-based to 0-based indexing works the way that it
  // does, but this has the desired effect in the UI, in practice.
  return new Range(
    [message.line - 1, message.start - 1],
    [message.line - 1, message.end],
  );
}

// A trace object is very similar to an error object.
function hackMessageToTrace(traceError: SingleHackMessage): Object {
  return {
    type: 'Trace',
    text: traceError.descr,
    filePath: traceError.path,
    range: extractRange(traceError),
  };
}

function hackMessageToDiagnosticMessage(
  hackDiagnostic: {message: HackDiagnostic},
): FileDiagnosticMessage {
  const {message: hackMessages} = hackDiagnostic;

  const causeMessage = hackMessages[0];
  invariant(causeMessage.path != null);
  const diagnosticMessage: FileDiagnosticMessage = {
    scope: 'file',
    providerName: `Hack: ${hackMessages[0].code}`,
    type: 'Error',
    text: causeMessage.descr,
    filePath: causeMessage.path,
    range: extractRange(causeMessage),
  };

  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (hackMessages.length > 1) {
    diagnosticMessage.trace = hackMessages.slice(1).map(hackMessageToTrace);
  }

  return diagnosticMessage;
}

export function convertDiagnostics(
  result: HackDiagnosticsResult,
): DiagnosticProviderUpdate {
  const diagnostics = result.errors;
  // Convert array messages to Error Objects with Traces.
  const fileDiagnostics = diagnostics.map(hackMessageToDiagnosticMessage);

  const filePathToMessages = new Map();
  for (const diagnostic of fileDiagnostics) {
    const path = diagnostic.filePath;
    let diagnosticArray = filePathToMessages.get(path);
    if (!diagnosticArray) {
      diagnosticArray = [];
      filePathToMessages.set(path, diagnosticArray);
    }
    diagnosticArray.push(diagnostic);
  }

  return {filePathToMessages};
}
