'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CodeFormatProvider} from '../../nuclide-code-format/lib/types';
import type {DiagnosticProvider} from '../../nuclide-diagnostics-base';
import type {HyperclickProvider} from '../../hyperclick';
import type {OutlineProvider} from '../../nuclide-outline-view';
import type {TypeHintProvider} from '../../nuclide-type-hint';

import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import {BusySignalProviderBase} from '../../nuclide-busy-signal';
import AutocompleteHelpers from './AutocompleteHelpers';
import CodeFormatHelpers from './CodeFormatHelpers';
import HyperclickHelpers from './HyperclickHelpers';
import OutlineViewHelpers from './OutlineViewHelpers';
import TypeHintHelpers from './TypeHintHelpers';
import ClangDiagnosticsProvider from './ClangDiagnosticsProvider';
import {GRAMMAR_SET, PACKAGE_NAME} from './constants';
import {reset} from './libclang';

let busySignalProvider: ?BusySignalProviderBase = null;
let diagnosticProvider: ?ClangDiagnosticsProvider = null;
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
      if (diagnosticProvider != null) {
        diagnosticProvider.invalidateBuffer(editor.getBuffer());
        diagnosticProvider.runDiagnostics(editor);
      }
    }),
  );

  busySignalProvider = new BusySignalProviderBase();
  diagnosticProvider = new ClangDiagnosticsProvider(busySignalProvider);
  subscriptions.add(diagnosticProvider);
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

export function getHyperclickProvider(): HyperclickProvider {
  const IDENTIFIER_REGEXP = /([a-zA-Z_][a-zA-Z0-9_]*)/g;
  return {
    // It is important that this has a lower priority than the handler from
    // fb-diffs-and-tasks.
    priority: 10,
    providerName: PACKAGE_NAME,
    wordRegExp: IDENTIFIER_REGEXP,
    getSuggestionForWord(editor, text, range) {
      return HyperclickHelpers.getSuggestionForWord(editor, text, range);
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

export function provideDiagnostics(): DiagnosticProvider {
  invariant(diagnosticProvider);
  return diagnosticProvider;
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

export function deactivate() {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
}
