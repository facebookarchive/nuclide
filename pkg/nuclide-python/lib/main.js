'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {OutlineProvider} from '../../nuclide-outline-view';

import {GRAMMAR_SET} from './constants';
import AutocompleteHelpers from './AutocompleteHelpers';

export function activate() {
}

export function createAutocompleteProvider(): atom$AutocompleteProvider {
  return {
    selector: '.source.python',
    inclusionPriority: 5,
    suggestionPriority: 5,  // Higher than the snippets provider.
    getSuggestions(request) {
      return AutocompleteHelpers.getAutocompleteSuggestions(request);
    },
  };
}

export function provideOutlines(): OutlineProvider {
  const {PythonOutlineProvider} = require('./PythonOutlineProvider');
  const provider = new PythonOutlineProvider();
  return {
    grammarScopes: Array.from(GRAMMAR_SET),
    priority: 1,
    name: 'Python',
    getOutline: provider.getOutline.bind(provider),
  };
}

export function deactivate() {
}
