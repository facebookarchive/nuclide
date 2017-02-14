'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertDiagnostics = convertDiagnostics;
function convertDiagnostics(result) {
  const fileDiagnostics = result.map(diagnostic => graphqlMessageToDiagnosticMessage(diagnostic));

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

  return { filePathToMessages };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function graphqlMessageToDiagnosticMessage(graphqlMessage) {
  if (!(graphqlMessage.filePath !== null)) {
    throw new Error('Invariant violation: "graphqlMessage.filePath !== null"');
  }

  const diagnosticMessage = {
    scope: 'file',
    providerName: `GraphQL: ${graphqlMessage.type}`,
    type: 'Error',
    text: graphqlMessage.text,
    filePath: graphqlMessage.filePath,
    range: graphqlMessage.range
  };

  return diagnosticMessage;
}