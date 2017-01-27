/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {
  DefinitionQueryResult,
} from '../../nuclide-definition-service/lib/rpc-types';
import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';

export function getDefinition(
  query: string,
  position: atom$Point,
  filePath: NuclideUri,
): Promise<DefinitionQueryResult> {
  throw new Error('RPC stub');
}

export type GraphQLDiagnosticMessage = {
  name: string,
  type: string,
  text: string,
  range: atom$Range,
  filePath: string,
};

export function getDiagnostics(
  query: string,
  filePath: NuclideUri,
): Promise<Array<GraphQLDiagnosticMessage>> {
  throw new Error('RPC stub');
}

export function getOutline(query: string): Promise<Outline> {
  throw new Error('RPC stub');
}

export type GraphQLAutocompleteSuggestionType = {
  text: string,
  typeName: ?string,
  description: ?string,
};

export function getAutocompleteSuggestions(
  query: string,
  position: atom$Point,
  filePath: NuclideUri,
): Promise<Array<GraphQLAutocompleteSuggestionType>> {
  throw new Error('RPC stub');
}

// Gracefully terminates the connection.
export function disconnect(): void {
  throw new Error('RPC stub');
}
