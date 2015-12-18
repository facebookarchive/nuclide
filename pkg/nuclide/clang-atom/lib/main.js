'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickProvider} from '../../hyperclick-interfaces';
import type {
  BusySignalProviderBase as BusySignalProviderBaseType,
} from '../../busy-signal-provider-base';
import type {DiagnosticProvider} from '../../diagnostics/base';
import type ClangDiagnosticsProvider from './ClangDiagnosticsProvider';

import {CompositeDisposable} from 'atom';
import {trackOperationTiming} from '../../analytics';

let busySignalProvider: ?BusySignalProviderBaseType = null;
let diagnosticProvider: ?ClangDiagnosticsProvider = null;
let subscriptions: ?CompositeDisposable = null;

function getBusySignalProvider(): BusySignalProviderBaseType {
  if (!busySignalProvider) {
    const {BusySignalProviderBase} = require('../../busy-signal-provider-base');
    busySignalProvider = new BusySignalProviderBase();
  }
  return busySignalProvider;
}

function getDiagnosticsProvider(): ClangDiagnosticsProvider {
  if (!diagnosticProvider) {
    const provider = require('./ClangDiagnosticsProvider');
    diagnosticProvider = new provider(getBusySignalProvider());
  }
  return diagnosticProvider;
}

module.exports = {
  activate() {
    const {projects} = require('../../atom-helpers');
    subscriptions = new CompositeDisposable();
    // Invalidate all diagnostics when closing the project.
    subscriptions.add(projects.onDidRemoveProjectPath((projectPath) => {
      if (diagnosticProvider != null) {
        diagnosticProvider.invalidateProjectPath(projectPath);
      }
    }));
  },

  /** Provider for autocomplete service. */
  createAutocompleteProvider(): atom$AutocompleteProvider {
    const {AutocompleteProvider} = require('./AutocompleteProvider');
    const autocompleteProvider = new AutocompleteProvider();

    return {
      selector: '.source.objc, .source.objcpp, .source.cpp, .source.c',
      inclusionPriority: 1,
      suggestionPriority: 5,  // Higher than the snippets provider.

      getSuggestions(
        request: atom$AutocompleteRequest
      ): Promise<Array<atom$AutocompleteSuggestion>> {
        return trackOperationTiming('nuclide-clang-atom:getAutocompleteSuggestions',
          () => autocompleteProvider.getAutocompleteSuggestions(request));
      },
    };
  },

  deactivate() {
    if (diagnosticProvider != null) {
      diagnosticProvider.dispose();
      diagnosticProvider = null;
    }
    if (subscriptions != null) {
      subscriptions.dispose();
      subscriptions = null;
    }
  },

  getHyperclickProvider(): HyperclickProvider {
    return require('./HyperclickProvider');
  },

  provideBusySignal(): BusySignalProviderBaseType {
    return getBusySignalProvider();
  },

  provideDiagnostics(): DiagnosticProvider {
    return getDiagnosticsProvider();
  },
};
