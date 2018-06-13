/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {CodeFormatProvider} from 'atom-ide-ui';
import type {FindReferencesViewService} from 'atom-ide-ui/pkg/atom-ide-find-references/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {ClangConfigurationProvider} from '../../nuclide-clang/lib/types';
import type {CqueryLanguageService} from '../../nuclide-cquery-lsp-rpc';
import type {
  CqueryProject,
  RequestLocationsResult,
} from '../../nuclide-cquery-lsp-rpc/lib/types';
import type {AtomLanguageServiceConfig} from '../../nuclide-language-service/lib/AtomLanguageService';

import createPackage from 'nuclide-commons-atom/createPackage';

import {getLogger} from 'log4js';
import featureConfig from 'nuclide-commons-atom/feature-config';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';
// TODO pelmers: maybe don't import from libclang
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {
  registerClangProvider,
  formatCode,
  resetForSource,
  getServerSettings,
} from '../../nuclide-clang/lib/libclang';
import passesGK from '../../commons-node/passesGK';
import {
  AtomLanguageService,
  getHostServices,
  updateAutocompleteResults,
  updateAutocompleteFirstResults,
} from '../../nuclide-language-service';
import {NullLanguageService} from '../../nuclide-language-service-rpc';
import {getNotifierByConnection} from '../../nuclide-open-files';
import {getCqueryLSPServiceByConnection} from '../../nuclide-remote-connection';
import {determineCqueryProject} from './CqueryProject';
import {wordUnderPoint} from './utils';

const NUCLIDE_CQUERY_GK = 'nuclide_cquery_lsp';
// Must match string in nuclide-clang/lib/constants.js
const NUCLIDE_CLANG_PACKAGE_NAME = 'nuclide-clang';
const USE_CQUERY_CONFIG = 'nuclide-cquery-lsp.use-cquery';
const GRAMMARS = ['source.cpp', 'source.c', 'source.objc', 'source.objcpp'];
let _referencesViewService: ?FindReferencesViewService;

type SaveState = {
  savedGkResult: boolean,
};

class CqueryNullLanguageService extends NullLanguageService
  implements CqueryLanguageService {
  async freshenIndexForFile(file: NuclideUri): Promise<void> {}
  async requestLocationsCommand(
    methodName: string,
    path: NuclideUri,
    point: atom$Point,
  ): Promise<RequestLocationsResult> {
    return [];
  }

  async deleteProject(project: CqueryProject): Promise<void> {}
}

function addCommands(
  atomService: AtomLanguageService<CqueryLanguageService>,
): IDisposable {
  const notificationCommands = [
    // This command just sends a notification to the server.
    atom.commands.add('atom-text-editor', 'cquery:freshen-index', async () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        const path: ?NuclideUri = editor.getPath();
        const service = await atomService.getLanguageServiceForUri(path);
        if (path != null && service != null) {
          service.freshenIndexForFile(path);
        }
      }
    }),
    // Equivalent to 'clang:clean-and-rebuild'
    atom.commands.add(
      'atom-text-editor',
      'cquery:clean-and-restart',
      async () => {
        const editor = atom.workspace.getActiveTextEditor();
        if (editor) {
          const path: ?NuclideUri = editor.getPath();
          const service = await atomService.getLanguageServiceForUri(path);
          if (path != null && service != null) {
            const project = await determineCqueryProject(path);
            await resetForSource(editor);
            await service.deleteProject(project);
          }
        }
      },
    ),
  ];
  // These commands all request locations in response to a position
  // which we can display in a find references pane.
  const requestCommands = [
    {
      command: 'cquery:find-variables',
      methodName: '$cquery/vars',
      title: 'Variables',
    },
    {
      command: 'cquery:find-callers',
      methodName: '$cquery/callers',
      title: 'Callers',
    },
    {
      command: 'cquery:find-base-class',
      methodName: '$cquery/base',
      title: 'Base classes',
    },
    {
      command: 'cquery:find-derived-class',
      methodName: '$cquery/derived',
      title: 'Derived classes',
    },
  ].map(({command, methodName, title}) =>
    atom.commands.add('atom-text-editor', command, async () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        const point = editor.getCursorBufferPosition();
        const path: ?NuclideUri = editor.getPath();
        const name = wordUnderPoint(editor, point);
        const service = await atomService.getLanguageServiceForUri(path);
        if (service != null && path != null && name != null) {
          service
            .requestLocationsCommand(methodName, path, point)
            .then(locations => {
              if (_referencesViewService != null) {
                _referencesViewService.viewResults({
                  type: 'data',
                  baseUri: path,
                  referencedSymbolName: name,
                  title,
                  references: locations.map(loc => ({...loc, name: ''})),
                });
              }
            });
        }
      }
    }),
  );
  return new UniversalDisposable(...notificationCommands, ...requestCommands);
}

async function getConnection(connection): Promise<CqueryLanguageService> {
  const [fileNotifier, host] = await Promise.all([
    getNotifierByConnection(connection),
    getHostServices(),
  ]);
  const {defaultFlags} = getServerSettings();
  const cqueryService = await getCqueryLSPServiceByConnection(
    connection,
  ).createCqueryService({
    fileNotifier,
    host,
    logCategory: 'cquery-language-server',
    logLevel: 'WARN',
    enableLibclangLogs:
      featureConfig.get('nuclide-cquery-lsp.enable-libclang-logs') === true,
    defaultFlags: defaultFlags != null ? defaultFlags : [],
  });
  if (cqueryService == null && featureConfig.get(USE_CQUERY_CONFIG)) {
    const notification = atom.notifications.addWarning(
      'Could not enable cquery, would you like to switch to built-in C++ support?',
      {
        buttons: [
          {
            text: 'Use built-in C++ services',
            onDidClick: () => {
              featureConfig.set(USE_CQUERY_CONFIG, false);
              notification.dismiss();
            },
          },
          {
            text: 'Ignore',
            onDidClick: () => {
              notification.dismiss();
            },
          },
        ],
      },
    );
  }
  return cqueryService != null
    ? cqueryService
    : new CqueryNullLanguageService();
}

class Activation {
  _languageService: ?IDisposable;
  _subscriptions = new UniversalDisposable();
  _lastGkResult: boolean = false;

  constructor(state: ?SaveState) {
    if (state != null) {
      this._lastGkResult = Boolean(state.savedGkResult);
    }
    this._subscriptions.add(
      Observable.fromPromise(passesGK(NUCLIDE_CQUERY_GK)).subscribe(result => {
        // Only update the config if the GK value changed, since someone may
        // not pass GK but still want to have the feature on.
        if (this._lastGkResult !== result) {
          this._lastGkResult = result;
          featureConfig.set(USE_CQUERY_CONFIG, result);
        }
      }),
      featureConfig.observeAsStream(USE_CQUERY_CONFIG).subscribe(config => {
        if (config === true) {
          if (this._languageService == null) {
            this._languageService = this.initializeLsp();
          }
        } else {
          if (this._languageService != null) {
            this._languageService.dispose();
            this._languageService = null;
          }
        }
      }),
    );
  }

  serialize() {
    return {savedGkResult: this._lastGkResult};
  }

  consumeClangConfigurationProvider(
    provider: ClangConfigurationProvider,
  ): IDisposable {
    return registerClangProvider(provider);
  }

  consumeReferencesView(provider: FindReferencesViewService): IDisposable {
    _referencesViewService = provider;
    return new UniversalDisposable(() => {
      _referencesViewService = null;
    });
  }

  provideCodeFormat(): CodeFormatProvider {
    return {
      grammarScopes: GRAMMARS,
      priority: 1,
      formatEntireFile: formatCode,
    };
  }

  initializeLsp(): IDisposable {
    // First disable the built-in clang package if it's running.
    const disableNuclideClang = () => {
      if (atom.packages.isPackageActive(NUCLIDE_CLANG_PACKAGE_NAME)) {
        const pack = atom.packages.disablePackage(NUCLIDE_CLANG_PACKAGE_NAME);
        atom.packages.deactivatePackage(NUCLIDE_CLANG_PACKAGE_NAME).then(() => {
          if (pack != null) {
            // $FlowFixMe: fix failure to re-enable, at see atom/issues #16824
            pack.activationDisposables = null;
          }
        });
      }
    };
    disableNuclideClang();

    const atomConfig: AtomLanguageServiceConfig = {
      name: 'cquery',
      grammars: GRAMMARS,
      autocomplete: {
        inclusionPriority: 1,
        suggestionPriority: 3,
        disableForSelector: null,
        excludeLowerPriority: false,
        autocompleteCacherConfig: {
          updateResults: updateAutocompleteResults,
          updateFirstResults: updateAutocompleteFirstResults,
        },
        analytics: {
          eventName: 'nuclide-cquery-lsp',
          shouldLogInsertedSuggestion: false,
        },
        supportsResolve: false,
      },
      definition: {
        version: '0.1.0',
        priority: 1,
        definitionEventName: 'cquery.getDefinition',
      },
      diagnostics: {
        version: '0.2.0',
        analyticsEventName: 'cquery.observe-diagnostics',
      },
      codeAction: {
        version: '0.1.0',
        priority: 1,
        analyticsEventName: 'cquery.getActions',
        applyAnalyticsEventName: 'cquery.applyAction',
      },
      outline: {
        version: '0.1.0',
        analyticsEventName: 'cquery.outline',
        updateOnEdit: true,
        priority: 1,
      },
      typeHint: {
        version: '0.0.0',
        priority: 1,
        analyticsEventName: 'cquery.typeHint',
      },
      findReferences: {
        version: '0.1.0',
        analyticsEventName: 'cquery.findReferences',
      },
      signatureHelp: {
        version: '0.1.0',
        priority: 1,
        triggerCharacters: new Set(['(', ',']),
        analyticsEventName: 'cquery.signatureHelp',
      },
    };

    const languageService = new AtomLanguageService(
      getConnection,
      atomConfig,
      null,
      getLogger('cquery-language-server'),
    );
    languageService.activate();
    return new UniversalDisposable(
      languageService,
      addCommands(languageService),
      atom.packages.onDidActivatePackage(disableNuclideClang),
      () => atom.packages.activatePackage(NUCLIDE_CLANG_PACKAGE_NAME),
    );
  }

  dispose(): void {
    this._subscriptions.dispose();
    if (this._languageService != null) {
      this._languageService.dispose();
    }
  }
}

createPackage(module.exports, Activation);
