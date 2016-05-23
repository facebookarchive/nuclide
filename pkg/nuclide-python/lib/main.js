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
import type {DefinitionProvider} from '../../nuclide-definition-service';

import {GRAMMAR_SET} from './constants';
import AutocompleteHelpers from './AutocompleteHelpers';
import DefinitionHelpers from './DefinitionHelpers';
import OutlineHelpers from './OutlineHelpers';

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
  return {
    grammarScopes: Array.from(GRAMMAR_SET),
    priority: 1,
    name: 'Python',
    getOutline(editor) {
      return OutlineHelpers.getOutline(editor);
    },
  };
}

export function provideDefinitions(): DefinitionProvider {
  return {
    grammarScopes: Array.from(GRAMMAR_SET),
    priority: 20,
    name: 'PythonDefinitionProvider',
    getDefinition(editor, position) {
      return DefinitionHelpers.getDefinition(editor, position);
    },
  };
}

export function deactivate() {
}
