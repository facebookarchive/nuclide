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
import type {CodeFormatProvider} from '../../nuclide-code-format/lib/types';
import type {LinterProvider} from '../../nuclide-diagnostics-common';
import type {OutlineProvider} from '../../nuclide-outline-view';
import type {TypeHintProvider} from '../../nuclide-type-hint/lib/types';
import type {RefactorProvider} from '../../nuclide-refactorizer';
import type {DefinitionProvider} from '../../nuclide-definition-service';
import type {
  Definition,
  DefinitionQueryResult,
} from '../../nuclide-definition-service/lib/rpc-types';

import invariant from 'assert';
import {CompositeDisposable} from 'atom';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {BusySignalProviderBase} from '../../nuclide-busy-signal';
import AutocompleteHelpers from './AutocompleteHelpers';
import CodeFormatHelpers from './CodeFormatHelpers';
import DefinitionHelpers from './DefinitionHelpers';
import OutlineViewHelpers from './OutlineViewHelpers';
import TypeHintHelpers from './TypeHintHelpers';
import Refactoring from './Refactoring';
import ClangLinter from './ClangLinter';
import {GRAMMARS, GRAMMAR_SET, PACKAGE_NAME} from './constants';
import {reset} from './libclang';

let busySignalProvider: ?BusySignalProviderBase = null;
let subscriptions: ?CompositeDisposable = null;

export function activate() {
  subscriptions = new CompositeDisposable();
  // Provide a 'Clean and rebuild' command to restart the Clang server for the current file
  // and reset all compilation flags. Useful when BUCK targets or headers change,
  // since those are heavily cached for performance. Also great for testing!
  subscriptions.add(
    atom.commands.add('atom-workspace', 'nuclide-clang:clean-and-rebuild', async () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      const path = editor.getPath();
      if (path == null) {
        return;
      }
      await reset(editor);
    }),
  );

  busySignalProvider = new BusySignalProviderBase();
}

/** Provider for autocomplete service. */
export function createAutocompleteProvider(): atom$AutocompleteProvider {
  return {
    selector: '.source.objc, .source.objcpp, .source.cpp, .source.c',
    inclusionPriority: 1,
    suggestionPriority: 5,  // Higher than the snippets provider.
    getSuggestions(request) {
      return AutocompleteHelpers.getAutocompleteSuggestions(request);
    },
  };
}

export function createTypeHintProvider(): TypeHintProvider {
  return {
    inclusionPriority: 1,
    providerName: PACKAGE_NAME,
    selector: Array.from(GRAMMAR_SET).join(', '),
    typeHint(editor, position) {
      return TypeHintHelpers.typeHint(editor, position);
    },
  };
}

export function provideDefinitions(): DefinitionProvider {
  return {
    name: PACKAGE_NAME,
    priority: 20,
    grammarScopes: GRAMMARS,
    getDefinition(editor: TextEditor, position: atom$Point): Promise<?DefinitionQueryResult> {
      return DefinitionHelpers.getDefinition(editor, position);
    },
    getDefinitionById(filePath: NuclideUri, id: string): Promise<?Definition> {
      return DefinitionHelpers.getDefinitionById(filePath, id);
    },
  };
}

export function provideBusySignal(): BusySignalProviderBase {
  invariant(busySignalProvider);
  return busySignalProvider;
}

export function provideCodeFormat(): CodeFormatProvider {
  return {
    selector: Array.from(GRAMMAR_SET).join(', '),
    inclusionPriority: 1,
    formatEntireFile(editor, range) {
      return CodeFormatHelpers.formatEntireFile(editor, range);
    },
  };
}

export function provideLinter(): LinterProvider {
  return {
    grammarScopes: Array.from(GRAMMAR_SET),
    scope: 'file',
    lintOnFly: false,
    name: 'Clang',
    invalidateOnClose: true,
    lint(editor) {
      const getResult = () => ClangLinter.lint(editor);
      if (busySignalProvider) {
        return busySignalProvider.reportBusy(
          `Clang: compiling \`${editor.getTitle()}\``,
          getResult,
        );
      }
      return getResult();
    },
  };
}

export function provideOutlineView(): OutlineProvider {
  return {
    name: PACKAGE_NAME,
    priority: 10,
    grammarScopes: Array.from(GRAMMAR_SET),
    updateOnEdit: false,
    getOutline(editor) {
      return OutlineViewHelpers.getOutline(editor);
    },
  };
}

export function provideRefactoring(): RefactorProvider {
  return {
    grammarScopes: Array.from(GRAMMAR_SET),
    priority: 1,
    refactoringsAtPoint(editor, point) {
      return Refactoring.refactoringsAtPoint(editor, point);
    },
    refactor(request) {
      return Refactoring.refactor(request);
    },
  };
}

export function deactivate() {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
}
