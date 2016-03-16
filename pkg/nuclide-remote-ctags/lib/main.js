'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickProvider as HyperclickProviderType} from '../../hyperclick-interfaces';

export function activate(state: ?Object) {
}

export function getHyperclickProvider(): HyperclickProviderType {
  const {HyperclickProvider} = require('./HyperclickProvider');
  const provider = new HyperclickProvider();
  return {
    priority: 1, // Should be lower than all language-specific providers.
    providerName: 'nuclide-remote-ctags',
    getSuggestionForWord: provider.getSuggestionForWord.bind(provider),
  };
}

export function getQuickOpenProvider() {
  return require('./QuickOpenProvider');
}

export function deactivate() {
}
