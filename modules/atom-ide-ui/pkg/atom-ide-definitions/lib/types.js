/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

// position is the first char of the definition's identifier, while range
// includes the entire definition. For example in:
//   class Foo { }
// position should be the 'F' in Foo, while range should span the 'c' in class
// to the '}'
// id is a string which uniquely identifies this symbol in a project. It is not suitable
// for display to humans.
// name is a string suitable for display to humans.
// projectRoot is the root directory of the project containing this definition.
// name is required, and projectRoot is encouraged, when returning multiple results.
export type Definition = {
  path: NuclideUri,
  position: atom$Point,
  range?: atom$Range,
  id?: string,
  name?: string,
  language: string,
  projectRoot?: NuclideUri,
};

// Definition queries supply a point.
// The returned queryRange is the range within which the returned definition is valid.
// Typically queryRange spans the containing identifier around the query point.
export type DefinitionQueryResult = {
  queryRange: Array<atom$Range>,
  definitions: Array<Definition>,
};

// Provides definitions for a set of language grammars.
export type DefinitionProvider = {
  // If there are multiple providers for a given grammar,
  // the one with the highest priority will be used.
  priority: number,
  grammarScopes: Array<string>,
  getDefinition: (
    editor: TextEditor,
    position: atom$Point,
  ) => Promise<?DefinitionQueryResult>,
};

export type DefinitionPreviewProvider = {
  getDefinitionPreview(definition: Definition): Promise<string>,
};
