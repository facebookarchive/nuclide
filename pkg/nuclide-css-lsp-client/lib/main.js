/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

// $FlowFB
import type {ProjectSymbolSearchProvider} from '../../fb-go-to-project-symbol-dash-provider/lib/types';
import type {ServerConnection} from '../../nuclide-remote-connection';
import type {LanguageService} from '../../nuclide-language-service/lib/LanguageService';

import createPackage from 'nuclide-commons-atom/createPackage';

import {
  AtomLanguageService,
  getHostServices,
} from '../../nuclide-language-service';
import {NullLanguageService} from '../../nuclide-language-service-rpc';
import {getNotifierByConnection} from '../../nuclide-open-files';
import {getVSCodeLanguageServiceByConnection} from '../../nuclide-remote-connection';
import featureConfig from 'nuclide-commons-atom/feature-config';
import DashProjectSymbolProvider from './DashProjectSymbolProvider';
import {
  updateAutocompleteResults,
  updateAutocompleteFirstResults,
} from '../../nuclide-language-service';

async function connectToService(
  connection: ?ServerConnection,
): Promise<LanguageService> {
  const [fileNotifier, host] = await Promise.all([
    getNotifierByConnection(connection),
    getHostServices(),
  ]);

  const lspService = await getVSCodeLanguageServiceByConnection(
    connection,
  ).createMultiLspLanguageService(
    'css',
    'vscode-css-languageserver-bin/cssServerMain',
    ['--stdio'],
    {
      fileNotifier,
      host,
      projectFileNames: ['.arcconfig', '.flowconfig', '.hg', '.git'],
      fileExtensions: ['.css', '.less', '.scss'],
      logCategory: 'nuclide-css-lsp',
      logLevel: (featureConfig.get('nuclide-css-lsp-client.logLevel'): any),
      fork: true,
      waitForDiagnostics: false,
    },
  );
  return lspService || new NullLanguageService();
}

function createLanguageService(): AtomLanguageService<LanguageService> {
  return new AtomLanguageService(connectToService, {
    name: 'CSSLSPService',
    grammars: ['source.css', 'source.css.less', 'source.css.scss'],
    autocomplete: {
      inclusionPriority: 1,
      // Suggestions from the server are more relevant than snippets.
      suggestionPriority: 3,
      disableForSelector: null,
      excludeLowerPriority: false,
      autocompleteCacherConfig: {
        updateResults: updateAutocompleteResults,
        updateFirstResults: updateAutocompleteFirstResults,
      },
      analytics: {
        eventName: 'cssLSP.autocomplete',
        shouldLogInsertedSuggestion: true,
      },
      supportsResolve: false,
    },
    codeAction: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'cssLSP.codeAction',
      applyAnalyticsEventName: 'cssLSP.applyCodeAction',
    },
    definition: {
      version: '0.1.0',
      priority: 20,
      definitionEventName: 'cssLSP.get-definition',
    },
    findReferences: {
      version: '0.1.0',
      analyticsEventName: 'cssLSP.findReferences',
    },
    highlight: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'cssLSP.codehighlight',
    },
    outline: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'cssLSP.outline',
    },
  });
}

class Activation {
  _languageService: AtomLanguageService<LanguageService>;

  constructor() {
    this._languageService = createLanguageService();
    this._languageService.activate();
  }

  provideProjectSymbolSearch(): ProjectSymbolSearchProvider {
    return new DashProjectSymbolProvider(this._languageService);
  }

  dispose() {
    this._languageService.dispose();
  }
}

createPackage(module.exports, Activation);
