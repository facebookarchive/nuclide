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
import type {HackRange} from './rpc-types';
import type {HackSpan} from './OutlineView';
import type {
  Definition,
  DefinitionQueryResult,
} from '../../nuclide-definition-service/lib/rpc-types';

import invariant from 'assert';
import {hackRangeToAtomRange} from './HackHelpers';
import {Point} from 'simple-text-buffer';

export type HackDefinition = {
  name: string,
  result_type?: string,
  pos: HackRange,
  definition_pos: ?HackRange,
  definition_span?: HackSpan,
  definition_id?: string,
};

export function convertDefinitions(
  hackDefinitions: Array<HackDefinition>,
  filePath: NuclideUri,
  projectRoot: NuclideUri,
): ?DefinitionQueryResult {
  function convertDefinition(definition: HackDefinition): Definition {
    invariant(definition.definition_pos != null);
    return {
      path: definition.definition_pos.filename || filePath,
      position: new Point(
        definition.definition_pos.line - 1,
        definition.definition_pos.char_start - 1),
      // TODO: range, definition_id
      id: definition.name,
      name: definition.name,
      language: 'php',
      projectRoot,
    };
  }

  const filteredDefinitions = hackDefinitions
    .filter(definition => definition.definition_pos != null);
  if (filteredDefinitions.length === 0) {
    return null;
  }

  const definitions: Array<Definition> = filteredDefinitions
    .map(convertDefinition);

  return {
    queryRange: [hackRangeToAtomRange(filteredDefinitions[0].pos)],
    definitions,
  };
}
