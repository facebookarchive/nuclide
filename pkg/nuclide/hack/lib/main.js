'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TypeHint} from '../../type-hint-interfaces';
import type {
  BusySignalProviderBase as BusySignalProviderBaseType,
} from '../../busy-signal-provider-base';
import type {HyperclickProvider} from '../../hyperclick-interfaces';

import CodeHighlightProvider from './CodeHighlightProvider';
import {CompositeDisposable} from 'atom';
import {HACK_GRAMMARS} from '../../hack-common/lib/constants';

const HACK_GRAMMARS_STRING = HACK_GRAMMARS.join(', ');
const PACKAGE_NAME = 'nuclide-hack';

let subscriptions: ?CompositeDisposable = null;
let hackDiagnosticsProvider;
let busySignalProvider;

module.exports = {

  activate() {
    const {getCachedHackLanguageForUri} = require('./hack');
    const {projects} = require('../../atom-helpers');
    subscriptions = new CompositeDisposable();
    subscriptions.add(projects.onDidRemoveProjectPath(projectPath => {
      const hackLanguage = getCachedHackLanguageForUri(projectPath);
      if (hackLanguage) {
        hackLanguage.dispose();
      }
      if (hackDiagnosticsProvider) {
        hackDiagnosticsProvider.invalidateProjectPath(projectPath);
      }
    }));
  },

  /** Provider for autocomplete service. */
  createAutocompleteProvider(): atom$AutocompleteProvider {
    const AutocompleteProvider = require('./AutocompleteProvider');
    const autocompleteProvider = new AutocompleteProvider();

    return {
      selector: HACK_GRAMMARS.map(grammar => '.' + grammar).join(', '),
      inclusionPriority: 1,
      // The context-sensitive hack autocompletions are more relevant than snippets.
      suggestionPriority: 3,
      excludeLowerPriority: false,

      getSuggestions(
        request: atom$AutocompleteRequest,
      ): Promise<?Array<atom$AutocompleteSuggestion>> {
        return autocompleteProvider.getAutocompleteSuggestions(request);
      },
    };
  },

  getHyperclickProvider(): HyperclickProvider {
    const HackHyperclickProvider = require('./HyperclickProvider');
    const hackHyperclickProvider = new HackHyperclickProvider();
    const getSuggestionForWord =
        hackHyperclickProvider.getSuggestionForWord.bind(hackHyperclickProvider);
    return {
      priority: 20,
      providerName: PACKAGE_NAME,
      getSuggestionForWord,
    };
  },

  /** Provider for code format service. */
  createCodeFormatProvider(): any {
    const CodeFormatProvider = require('./CodeFormatProvider');
    const codeFormatProvider = new CodeFormatProvider();

    return {
      selector: HACK_GRAMMARS_STRING,
      inclusionPriority: 1,

      formatCode(editor: atom$TextEditor, range: atom$Range): Promise<string> {
        return codeFormatProvider.formatCode(editor, range);
      },
    };
  },

  createFindReferencesProvider(): any {
    return require('./FindReferencesProvider');
  },

  createTypeHintProvider(): any {
    const TypeHintProvider = require('./TypeHintProvider');
    const typeHintProvider = new TypeHintProvider();

    return {
      selector: HACK_GRAMMARS_STRING,
      inclusionPriority: 1,
      providerName: PACKAGE_NAME,

      typeHint(editor: atom$TextEditor, position: atom$Point): Promise<?TypeHint> {
        return typeHintProvider.typeHint(editor, position);
      },
    };
  },

  createCodeHighlightProvider(): any {
    const codeHighlightProvider = new CodeHighlightProvider();

    return {
      selector: HACK_GRAMMARS_STRING,
      inclusionPriority: 1,
      highlight(editor: atom$TextEditor, position: atom$Point): Promise<Array<atom$Range>> {
        return codeHighlightProvider.highlight(editor, position);
      },
    };
  },

  provideBusySignal(): BusySignalProviderBaseType {
    if (busySignalProvider == null) {
      const {BusySignalProviderBase} = require('../../busy-signal-provider-base');
      busySignalProvider = new BusySignalProviderBase();
    }
    return busySignalProvider;
  },

  provideDiagnostics() {
    if (!hackDiagnosticsProvider) {
      const HackDiagnosticsProvider = require('./HackDiagnosticsProvider');
      const busyProvider = this.provideBusySignal();
      hackDiagnosticsProvider = new HackDiagnosticsProvider(false, busyProvider);
    }
    return hackDiagnosticsProvider;
  },

  deactivate(): void {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
    if (hackDiagnosticsProvider) {
      hackDiagnosticsProvider.dispose();
      hackDiagnosticsProvider = null;
    }
  },
};
