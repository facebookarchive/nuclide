'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';
import type {
  BusySignalProviderBase as BusySignalProviderBaseType,
} from '../../nuclide-busy-signal';
import type {OutlineProvider} from '../../nuclide-outline-view';
import type {NuclideEvaluationExpressionProvider} from '../../nuclide-debugger-interfaces/service';
import type {DefinitionProvider} from '../../nuclide-definition-service';
import type {CoverageProvider} from '../../nuclide-type-coverage/lib/types';

import CodeHighlightProvider from './CodeHighlightProvider';
import {CompositeDisposable, Disposable} from 'atom';
import {HACK_GRAMMARS} from '../../nuclide-hack-common';
import {TypeCoverageProvider} from './TypeCoverageProvider';
import {OutlineViewProvider} from './OutlineViewProvider';
import {HackDefinitionProvider} from './HackDefinitionProvider';
import {onDidRemoveProjectPath} from '../../commons-atom/projects';
import AutocompleteProvider from './AutocompleteProvider';
import FindReferencesProvider from './FindReferencesProvider';
import TypeHintProvider from './TypeHintProvider';
import {HackEvaluationExpressionProvider} from './HackEvaluationExpressionProvider';
import HackDiagnosticsProvider from './HackDiagnosticsProvider';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {BusySignalProviderBase} from '../../nuclide-busy-signal';
import CodeFormatProvider from './CodeFormatProvider';
import {clearHackLanguageCache} from './HackLanguage';


const HACK_GRAMMARS_STRING = HACK_GRAMMARS.join(', ');
const PACKAGE_NAME = 'nuclide-hack';

let subscriptions: ?CompositeDisposable = null;
let hackDiagnosticsProvider;
let busySignalProvider;
let coverageProvider = null;
let definitionProvider: ?DefinitionProvider = null;

export function activate() {
  subscriptions = new CompositeDisposable();
  subscriptions.add(onDidRemoveProjectPath(projectPath => {
    if (hackDiagnosticsProvider) {
      hackDiagnosticsProvider.invalidateProjectPath(projectPath);
    }
  }));
  subscriptions.add(new Disposable(clearHackLanguageCache));
}

/** Provider for autocomplete service. */
export function createAutocompleteProvider(): atom$AutocompleteProvider {
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
}

/** Provider for code format service. */
export function createCodeFormatProvider(): any {
  const codeFormatProvider = new CodeFormatProvider();

  return {
    selector: HACK_GRAMMARS_STRING,
    inclusionPriority: 1,

    formatCode(editor: atom$TextEditor, range: atom$Range): Promise<string> {
      return codeFormatProvider.formatCode(editor, range);
    },
  };
}

export function createFindReferencesProvider(): any {
  return FindReferencesProvider;
}

export function createTypeHintProvider(): any {
  const typeHintProvider = new TypeHintProvider();

  return {
    selector: HACK_GRAMMARS_STRING,
    inclusionPriority: 1,
    providerName: PACKAGE_NAME,

    typeHint(editor: atom$TextEditor, position: atom$Point): Promise<?TypeHint> {
      return typeHintProvider.typeHint(editor, position);
    },
  };
}

export function createCodeHighlightProvider(): any {
  const codeHighlightProvider = new CodeHighlightProvider();

  return {
    selector: HACK_GRAMMARS_STRING,
    inclusionPriority: 1,
    highlight(editor: atom$TextEditor, position: atom$Point): Promise<Array<atom$Range>> {
      return codeHighlightProvider.highlight(editor, position);
    },
  };
}

export function createEvaluationExpressionProvider(): NuclideEvaluationExpressionProvider {
  const evaluationExpressionProvider = new HackEvaluationExpressionProvider();
  const getEvaluationExpression =
    evaluationExpressionProvider.getEvaluationExpression.bind(evaluationExpressionProvider);
  return {
    selector: HACK_GRAMMARS_STRING,
    name: PACKAGE_NAME,
    getEvaluationExpression,
  };
}

export function provideDiagnostics() {
  if (!hackDiagnosticsProvider) {
    const busyProvider = provideBusySignal();
    hackDiagnosticsProvider = new HackDiagnosticsProvider(false, busyProvider);
  }
  return hackDiagnosticsProvider;
}

export function deactivate(): void {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
  if (hackDiagnosticsProvider) {
    hackDiagnosticsProvider.dispose();
    hackDiagnosticsProvider = null;
  }
}

export function provideOutlines(): OutlineProvider {
  const provider = new OutlineViewProvider();
  return {
    grammarScopes: HACK_GRAMMARS,
    priority: 1,
    name: 'Hack',
    getOutline: provider.getOutline.bind(provider),
  };
}

function provideBusySignal(): BusySignalProviderBaseType {
  if (busySignalProvider == null) {
    busySignalProvider = new BusySignalProviderBase();
  }
  return busySignalProvider;
}

export function provideCoverage(): CoverageProvider {
  return {
    displayName: 'Hack',
    priority: 10,
    grammarScopes: HACK_GRAMMARS,
    getCoverage(path) {
      return getTypeCoverageProvider().getTypeCoverage(path);
    },
  };
}

function getTypeCoverageProvider(): TypeCoverageProvider {
  if (coverageProvider == null) {
    coverageProvider = new TypeCoverageProvider();
  }
  return coverageProvider;
}

export function provideDefinitions(): DefinitionProvider {
  if (definitionProvider == null) {
    definitionProvider = new HackDefinitionProvider();
  }
  return definitionProvider;
}
