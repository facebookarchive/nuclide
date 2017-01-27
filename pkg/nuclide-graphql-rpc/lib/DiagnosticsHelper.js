/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import invariant from 'assert';
import type {
  FileDiagnosticMessage,
  DiagnosticProviderUpdate,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {GraphQLDiagnosticMessage} from './GraphQLServerService';

export function convertDiagnostics(
  result: Array<GraphQLDiagnosticMessage>,
): DiagnosticProviderUpdate {
  const fileDiagnostics = result.map(
    diagnostic => graphqlMessageToDiagnosticMessage(diagnostic),
  );

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

function graphqlMessageToDiagnosticMessage(
  graphqlMessage: GraphQLDiagnosticMessage,
): FileDiagnosticMessage {
  invariant(graphqlMessage.filePath !== null);
  const diagnosticMessage: FileDiagnosticMessage = {
    scope: 'file',
    providerName: `GraphQL: ${graphqlMessage.type}`,
    type: 'Error',
    text: graphqlMessage.text,
    filePath: graphqlMessage.filePath,
    range: graphqlMessage.range,
  };

  return diagnosticMessage;
}
