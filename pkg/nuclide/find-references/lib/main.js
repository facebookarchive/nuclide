'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Reference} from './types';

type FindReferencesData = {
  referencedSymbolName: string;
  references: Array<Reference>;
};

type FindReferencesProvider = {
  findReferences(editor: TextEditor, position: atom$Point): Promise<FindReferencesData>;
};

var providers: Array<FindReferencesProvider> = [];

module.exports = {

  activate(state: ?any): void {
    // TODO
  },

  deactivate(): void {
    providers = [];
  },

  consumeProvider(provider: FindReferencesProvider): void {
    providers.push(provider);
  },

};
