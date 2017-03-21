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
import type {Definition, DefinitionQueryResult} from './rpc-types';

import {Disposable} from 'atom';
import invariant from 'assert';
import ProviderRegistry from '../../commons-atom/ProviderRegistry';

// Provides definitions for a set of language grammars.
export type DefinitionProvider = {
  name: string,
  // If there are multiple providers for a given grammar, the one with the highest priority will be
  // used.
  priority: number,
  grammarScopes: Array<string>,
  getDefinition: (editor: TextEditor, position: atom$Point) => Promise<?DefinitionQueryResult>,
  // filename is any file/path in the project containing id.
  getDefinitionById: (filename: NuclideUri, id: string) => Promise<?Definition>,
};

export type DefinitionService = {
  getDefinition(editor: TextEditor, position: atom$Point): Promise<?DefinitionQueryResult>,
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
    return provider == null ? null : provider.getDefinition(editor, position);
  }

  consumeDefinitionProvider(provider: DefinitionProvider): IDisposable {
    this._providers.addProvider(provider);
    return new Disposable(() => { this._providers.removeProvider(provider); });
  }
}

let activation: ?Service = null;

export function activate() {
  if (activation == null) {
    activation = new Service();
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
