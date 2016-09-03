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
import type {FindReferencesProvider} from '../../nuclide-find-references';
import type {CodeFormatProvider} from '../../nuclide-code-format/lib/types';
import type {LinterProvider} from '../../nuclide-diagnostics-common';

import invariant from 'assert';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {DedupedBusySignalProviderBase} from '../../nuclide-busy-signal';
import {GRAMMAR_SET} from './constants';
import {getLintOnFly} from './config';
import AutocompleteHelpers from './AutocompleteHelpers';
import DefinitionHelpers from './DefinitionHelpers';
import OutlineHelpers from './OutlineHelpers';
import ReferenceHelpers from './ReferenceHelpers';
import CodeFormatHelpers from './CodeFormatHelpers';
import LintHelpers from './LintHelpers';

let busySignalProvider: ?DedupedBusySignalProviderBase = null;

export function activate() {
  busySignalProvider = new DedupedBusySignalProviderBase();
}

export function createAutocompleteProvider(): atom$AutocompleteProvider {
  return {
    selector: '.source.python',
    disableForSelector: '.source.python .comment, .source.python .string',
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
    getDefinitionById(filePath, id) {
      return DefinitionHelpers.getDefinitionById(filePath, id);
    },
  };
}

export function provideReferences(): FindReferencesProvider {
  return {
    async isEditorSupported(textEditor) {
      const fileUri = textEditor.getPath();
      if (!fileUri || !GRAMMAR_SET.has(textEditor.getGrammar().scopeName)) {
        return false;
      }
      return true;
    },
    findReferences(editor, position) {
      return ReferenceHelpers.getReferences(editor, position);
    },
  };
}

export function provideCodeFormat(): CodeFormatProvider {
  return {
    selector: 'source.python',
    inclusionPriority: 1,
    formatEntireFile(editor, range) {
      invariant(busySignalProvider);
      return busySignalProvider.reportBusy(
        `Python: formatting \`${editor.getTitle()}\``,
        () => CodeFormatHelpers.formatEntireFile(editor, range),
      );
    },
  };
}

export function provideLint(): LinterProvider {
  return {
    grammarScopes: Array.from(GRAMMAR_SET),
    scope: 'file',
    lintOnFly: getLintOnFly(),
    name: 'nuclide-python',
    invalidateOnClose: true,
    lint(editor) {
      invariant(busySignalProvider);
      return busySignalProvider.reportBusy(
        `Python: Waiting for flake8 lint results for \`${editor.getTitle()}\``,
        () => LintHelpers.lint(editor),
      );
    },
  };
}

export function provideBusySignal(): DedupedBusySignalProviderBase {
  invariant(busySignalProvider);
  return busySignalProvider;
}

export function deactivate() {
}
