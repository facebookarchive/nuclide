'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

import {Disposable} from 'atom';
import invariant from 'assert';
import ProviderRegistry from '../../commons-atom/ProviderRegistry';

// position is the first char of the definition's identifier, while range
// includes the entire definition. For example in:
//   class Foo { }
// position should be the 'F' in Foo, while range should span the 'c' in class
// to the '}'
// definition is a string which uniquely identifies this symbol in a project.
export type Definition = {
  path: NuclideUri;
  position: atom$Point;
  range: ?atom$Range;
  definition: ?string;
};

// Definition queries supply a point.
// The returned queryRange is the range within which the returned definition is valid.
// Typically queryRange spans the containing identifier around the query point.
export type DefinitionQueryResult = {
  queryRange: atom$Range;
  definition: Definition;
};

// Provides definitions for a set of language grammars.
export type DefinitionProvider = {
  name: string;
  // If there are multiple providers for a given grammar, the one with the highest priority will be
  // used.
  priority: number;
  grammarScopes: Array<string>;
  getDefinition: (editor: TextEditor, position: atom$Point) => Promise<?DefinitionQueryResult>;
};

export type DefinitionService = {
  getDefinition(editor: TextEditor, position: atom$Point): Promise<?DefinitionQueryResult>;
};

// Provides definitions given a file & position.
// Relies on per-language(grammar) providers to provide results.
export class Service {
  _providers: ProviderRegistry<DefinitionProvider>;

  constructor() {
    this._providers = new ProviderRegistry();
  }

  dispose() {

  }

  async getDefinition(editor: TextEditor, position: atom$Point): Promise<?DefinitionQueryResult> {
    const provider = this._providers.getProviderForEditor(editor);
    return provider == null ? null : await provider.getDefinition(editor, position);
  }

  consumeDefinitionProvider(provider: DefinitionProvider): IDisposable {
    this._providers.addProvider(provider);
    return new Disposable(() => { this._providers.removeProvider(provider); });
  }
}

let activation: ?Service = null;

export function activate(state: Object | void) {
  if (activation == null) {
    activation = new Service(state);
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

export function consumeDefinitionProvider(provider: DefinitionProvider): IDisposable {
  invariant(activation != null);
  return activation.consumeDefinitionProvider(provider);
}

export function provideDefinitionService(): DefinitionService {
  invariant(activation != null);
  return {
    getDefinition: activation.getDefinition.bind(activation),
  };
}
