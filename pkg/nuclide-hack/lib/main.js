'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TypeHint} from '../../nuclide-type-hint-interfaces';
import type {
  BusySignalProviderBase as BusySignalProviderBaseType,
} from '../../nuclide-busy-signal-provider-base';
import type {HyperclickProvider} from '../../hyperclick-interfaces';
import type {OutlineProvider} from '../../nuclide-outline-view';

import CodeHighlightProvider from './CodeHighlightProvider';
import {CompositeDisposable} from 'atom';
import {HACK_GRAMMARS} from '../../nuclide-hack-common';
import {
  SHOW_TYPE_COVERAGE_CONFIG_PATH,
  getShowTypeCoverage,
  setShowTypeCoverage,
} from './config';
import {TypeCoverageProvider} from './TypeCoverageProvider';
import {OutlineViewProvider} from './OutlineViewProvider';
import {onDidChange} from '../../nuclide-feature-config';
import invariant from 'assert';

const HACK_GRAMMARS_STRING = HACK_GRAMMARS.join(', ');
const PACKAGE_NAME = 'nuclide-hack';

let subscriptions: ?CompositeDisposable = null;
let hackDiagnosticsProvider;
let busySignalProvider;
let hackTypeCoverageProviderSubscription = null;
let coverageProvider = null;

module.exports = {

  activate() {
    const {getCachedHackLanguageForUri} = require('./hack');
    const {projects} = require('../../nuclide-atom-helpers');
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
    subscriptions.add(onDidChange(SHOW_TYPE_COVERAGE_CONFIG_PATH,
      (delta: {newValue: boolean; oldValue: boolean}) => {
        if (delta.newValue) {
          enableCoverageProvider();
        } else {
          disableCoverageProvider();
        }
      }));
    subscriptions.add(
      atom.commands.add('atom-workspace',
        'nuclide-hack:toggle-type-coverage', toggleTypeCoverage));

    if (getShowTypeCoverage()) {
      enableCoverageProvider();
    }
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

  provideDiagnostics() {
    if (!hackDiagnosticsProvider) {
      const HackDiagnosticsProvider = require('./HackDiagnosticsProvider');
      const busyProvider = provideBusySignal();
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
    disableCoverageProvider();
  },

  provideOutlines(): OutlineProvider {
    const provider = new OutlineViewProvider();
    return {
      grammarScopes: HACK_GRAMMARS,
      priority: 1,
      name: 'Hack',
      getOutline: provider.getOutline.bind(provider),
    };
  },
};

function provideBusySignal(): BusySignalProviderBaseType {
  if (busySignalProvider == null) {
    const {BusySignalProviderBase} = require('../../nuclide-busy-signal-provider-base');
    busySignalProvider = new BusySignalProviderBase();
  }
  return busySignalProvider;
}

function enableCoverageProvider(): void {
  if (coverageProvider == null) {
    coverageProvider = new TypeCoverageProvider(provideBusySignal());
    invariant(hackTypeCoverageProviderSubscription == null);
    hackTypeCoverageProviderSubscription = atom.packages.serviceHub.provide(
      'nuclide-diagnostics-provider', '0.1.0',
      coverageProvider);
  }
}

function disableCoverageProvider(): void {
  if (hackTypeCoverageProviderSubscription != null) {
    hackTypeCoverageProviderSubscription.dispose();
    hackTypeCoverageProviderSubscription = null;
  }
  if (coverageProvider != null) {
    coverageProvider.dispose();
    coverageProvider = null;
  }
}

function toggleTypeCoverage(): void {
  setShowTypeCoverage(!getShowTypeCoverage());
}
