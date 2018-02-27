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

import type {
  FindReferencesReturn,
  DefinitionQueryResult,
  Outline,
  CodeAction,
  CodeFormatProvider,
} from 'atom-ide-ui';
import type {FindReferencesViewService} from 'atom-ide-ui/pkg/atom-ide-find-references/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {DeadlineRequest} from 'nuclide-commons/promise';
import type {ConnectableObservable} from 'rxjs';
import type {CqueryLanguageService} from '../../nuclide-cquery-lsp-rpc';
import type {ClangConfigurationProvider} from '../../nuclide-clang/lib/types';
import type {CqueryProject} from '../../nuclide-cquery-lsp-rpc/lib/types';
import type {NuclideEvaluationExpression} from 'nuclide-debugger-common';
import type {AtomLanguageServiceConfig} from '../../nuclide-language-service/lib/AtomLanguageService';
import type {
  LanguageService,
  SymbolResult,
  FileDiagnosticMap,
  AutocompleteResult,
  AutocompleteRequest,
  FileDiagnosticMessage,
} from '../../nuclide-language-service/lib/LanguageService';
import type {AdditionalLogFile} from '../../nuclide-logging/lib/rpc-types';
import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';
import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';

import createPackage from 'nuclide-commons-atom/createPackage';

import {getLogger} from 'log4js';
import featureConfig from 'nuclide-commons-atom/feature-config';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';
// TODO pelmers: maybe don't import from libclang
// eslint-disable-next-line rulesdir/no-cross-atom-imports
import {
  registerClangProvider,
  formatCode,
} from '../../nuclide-clang/lib/libclang';
import passesGK from '../../commons-node/passesGK';
import {
  AtomLanguageService,
  getHostServices,
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

// Wrapper that queries for clang settings when new files seen.
class CqueryLSPClient extends NullLanguageService {
  _service: CqueryLanguageService;
  _logger: log4js$Logger;
  _subscriptions = new UniversalDisposable();

  constructor(service: CqueryLanguageService) {
    super();
    this._service = service;
    this._logger = getLogger('cquery-language-server');
    this._subscriptions.add(service, this._addCommands());
  }

  dispose() {
    this._subscriptions.dispose();
  }

  _addCommands(): IDisposable {
    // This command just sends a notification to the server.
    const notificationCommands = [
      atom.commands.add('atom-text-editor', 'cquery:freshen-index', () => {
        const editor = atom.workspace.getActiveTextEditor();
        if (editor) {
          const path: ?NuclideUri = editor.getPath();
          if (this._service && path != null) {
            this._service.freshenIndexForFile(path);
          }
        }
      }),
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
      atom.commands.add('atom-text-editor', command, () => {
        const editor = atom.workspace.getActiveTextEditor();
        if (editor) {
          const point = editor.getCursorBufferPosition();
          const path: ?NuclideUri = editor.getPath();
          const name = wordUnderPoint(editor, point);
          if (this._service && path != null && name != null) {
            this._service
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

  async ensureProject(file: string): Promise<?CqueryProject> {
    const project = await determineCqueryProject(file);
    return this._service
      .associateFileWithProject(file, project)
      .then(() => project, () => null);
  }

  async getDiagnostics(fileVersion: FileVersion): Promise<?FileDiagnosticMap> {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null ? null : this._service.getDiagnostics(fileVersion);
  }

  async getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    request: AutocompleteRequest,
  ): Promise<?AutocompleteResult> {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null
      ? null
      : this._service.getAutocompleteSuggestions(
          fileVersion,
          position,
          request,
        );
  }

  async getAdditionalLogFiles(
    deadline: DeadlineRequest,
  ): Promise<Array<AdditionalLogFile>> {
    return this._service.getAdditionalLogFiles(deadline);
  }

  async getDefinition(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null
      ? null
      : this._service.getDefinition(fileVersion, position);
  }

  findReferences(
    fileVersion: FileVersion,
    position: atom$Point,
  ): ConnectableObservable<?FindReferencesReturn> {
    return Observable.fromPromise(this.ensureProject(fileVersion.filePath))
      .concatMap(project => {
        return project == null
          ? Observable.of(null)
          : this._service.findReferences(fileVersion, position).refCount();
      })
      .publish();
  }

  async getCoverage(filePath: NuclideUri): Promise<?CoverageResult> {
    const project = await this.ensureProject(filePath);
    return project == null ? null : this._service.getCoverage(filePath);
  }

  async getOutline(fileVersion: FileVersion): Promise<?Outline> {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null ? null : this._service.getOutline(fileVersion);
  }

  async getCodeActions(
    fileVersion: FileVersion,
    range: atom$Range,
    diagnostics: Array<FileDiagnosticMessage>,
  ): Promise<Array<CodeAction>> {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null
      ? []
      : this._service.getCodeActions(fileVersion, range, diagnostics);
  }

  async highlight(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?Array<atom$Range>> {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null
      ? null
      : this._service.highlight(fileVersion, position);
  }

  async getEvaluationExpression(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null
      ? null
      : this._service.getEvaluationExpression(fileVersion, position);
  }

  async getProjectRoot(filePath: NuclideUri): Promise<?NuclideUri> {
    const project = await this.ensureProject(filePath);
    return project == null ? null : this._service.getProjectRoot(filePath);
  }

  async isFileInProject(filePath: NuclideUri): Promise<boolean> {
    const project = await this.ensureProject(filePath);
    return project != null;
  }

  observeDiagnostics(): ConnectableObservable<FileDiagnosticMap> {
    return this._service.observeDiagnostics();
  }

  async typeHint(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?TypeHint> {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null
      ? null
      : this._service.typeHint(fileVersion, position);
  }

  async supportsSymbolSearch(directories: Array<NuclideUri>): Promise<boolean> {
    // TODO pelmers: wrap with ensure server
    return this._service.supportsSymbolSearch(directories);
  }

  async symbolSearch(
    query: string,
    directories: Array<NuclideUri>,
  ): Promise<?Array<SymbolResult>> {
    return this._service.symbolSearch(query, directories);
  }
}

async function getConnection(connection): Promise<LanguageService> {
  const [fileNotifier, host] = await Promise.all([
    getNotifierByConnection(connection),
    getHostServices(),
  ]);
  const cqueryService = await getCqueryLSPServiceByConnection(
    connection,
  ).createCqueryService({
    fileNotifier,
    host,
    logCategory: 'cquery-language-server',
    logLevel: 'WARN',
    enableLibclangLogs:
      featureConfig.get('nuclide-cquery-lsp.enable-libclang-logs') === true,
  });
  return cqueryService != null
    ? new CqueryLSPClient(cqueryService)
    : new NullLanguageService();
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
        autocompleteCacherConfig: null,
        analytics: {
          eventName: 'nuclide-cquery-lsp',
          shouldLogInsertedSuggestion: false,
        },
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
