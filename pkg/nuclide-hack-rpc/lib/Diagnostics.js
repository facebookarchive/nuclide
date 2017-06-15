'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hackMessageToDiagnosticMessage = hackMessageToDiagnosticMessage;

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

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
function extractRange(message) {
  // It's unclear why the 1-based to 0-based indexing works the way that it
  // does, but this has the desired effect in the UI, in practice.
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range([message.line - 1, message.start - 1], [message.line - 1, message.end]);
}

// A trace object is very similar to an error object.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function hackMessageToTrace(traceError) {
  return {
    type: 'Trace',
    text: traceError.descr,
    filePath: traceError.path,
    range: extractRange(traceError)
  };
}

function hackMessageToDiagnosticMessage(hackMessages) {
  // This is verified to be non-empty string by the caller in HackService
  const causeMessage = hackMessages[0];

  if (!(causeMessage.path != null)) {
    throw new Error('Invariant violation: "causeMessage.path != null"');
  }

  const diagnosticMessage = {
    scope: 'file',
    providerName: `Hack: ${hackMessages[0].code}`,
    type: 'Error',
    text: causeMessage.descr,
    filePath: causeMessage.path,
    range: extractRange(causeMessage)
  };

  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (hackMessages.length > 1) {
    diagnosticMessage.trace = hackMessages.slice(1)
    // Skip traces without position since they are not useful, and would crash
    // the RPC connection. See comment in HackService.
    .filter(x => {
      return x.path !== '';
    }).map(hackMessageToTrace);
  }

  return diagnosticMessage;
}