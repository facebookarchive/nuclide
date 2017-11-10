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
} from 'atom-ide-ui';
import type {TextEdit} from 'nuclide-commons-atom/text-edit';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {DeadlineRequest} from 'nuclide-commons/promise';
import type {ConnectableObservable} from 'rxjs';
import type {ClangdLanguageService} from '../../nuclide-clangd-lsp-rpc';
import type {ClangConfigurationProvider} from '../../nuclide-clang/lib/types';
import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';
import type {AtomLanguageServiceConfig} from '../../nuclide-language-service/lib/AtomLanguageService';
import type {
  LanguageService,
  SymbolResult,
  FileDiagnosticMap,
  FormatOptions,
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
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import passesGK from '../../commons-node/passesGK';
// TODO pelmers: maybe don't import from libclang
// eslint-disable-next-line rulesdir/no-cross-atom-imports
import {
  registerClangProvider,
  getClangRequestSettings,
} from '../../nuclide-clang/lib/libclang';
import {
  AtomLanguageService,
  getHostServices,
  updateAutocompleteResults,
  updateAutocompleteFirstResults,
} from '../../nuclide-language-service';
import {NullLanguageService} from '../../nuclide-language-service-rpc';
import {getNotifierByConnection} from '../../nuclide-open-files';
import {getClangdLSPServiceByConnection} from '../../nuclide-remote-connection';

const FB_CLANGD_LSP_GK = 'nuclide_clangd_lsp';

// Wrapper that queries for clang settings when new files seen.
class ClangdLSPClient {
  _service: ClangdLanguageService;
  _logger: log4js$Logger;

  constructor(service: ClangdLanguageService) {
    this._service = service;
    this._logger = getLogger('clangd-language-server');
  }

  dispose() {
    this._service.dispose();
  }

  async ensureServer(path: string): Promise<void> {
    if (!await this._service.isFileKnown(path)) {
      const settings = await getClangRequestSettings(path);
      if (settings != null) {
        if (!await this._service.addClangRequest(settings)) {
          this._logger.error('Failure adding settings for ' + path);
        }
      }
    }
  }

  async getDiagnostics(fileVersion: FileVersion): Promise<?FileDiagnosticMap> {
    await this.ensureServer(fileVersion.filePath);
    return this._service.getDiagnostics(fileVersion);
  }

  async getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    request: AutocompleteRequest,
  ): Promise<?AutocompleteResult> {
    await this.ensureServer(fileVersion.filePath);
    return this._service.getAutocompleteSuggestions(
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
    await this.ensureServer(fileVersion.filePath);
    return this._service.getDefinition(fileVersion, position);
  }

  async findReferences(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?FindReferencesReturn> {
    await this.ensureServer(fileVersion.filePath);
    return this._service.findReferences(fileVersion, position);
  }

  async getCoverage(filePath: NuclideUri): Promise<?CoverageResult> {
    await this.ensureServer(filePath);
    return this._service.getCoverage(filePath);
  }

  async getOutline(fileVersion: FileVersion): Promise<?Outline> {
    await this.ensureServer(fileVersion.filePath);
    return this._service.getOutline(fileVersion);
  }

  async getCodeActions(
    fileVersion: FileVersion,
    range: atom$Range,
    diagnostics: Array<FileDiagnosticMessage>,
  ): Promise<Array<CodeAction>> {
    await this.ensureServer(fileVersion.filePath);
    return this._service.getCodeActions(fileVersion, range, diagnostics);
  }

  async highlight(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?Array<atom$Range>> {
    await this.ensureServer(fileVersion.filePath);
    return this.highlight(fileVersion, position);
  }

  async formatSource(
    fileVersion: FileVersion,
    range: atom$Range,
    options: FormatOptions,
  ): Promise<?Array<TextEdit>> {
    await this.ensureServer(fileVersion.filePath);
    return this._service.formatSource(fileVersion, range, options);
  }

  async formatAtPosition(
    fileVersion: FileVersion,
    position: atom$Point,
    triggerCharacter: string,
    options: FormatOptions,
  ): Promise<?Array<TextEdit>> {
    await this.ensureServer(fileVersion.filePath);
    return this._service.formatAtPosition(
      fileVersion,
      position,
      triggerCharacter,
      options,
    );
  }

  async formatEntireFile(
    fileVersion: FileVersion,
    range: atom$Range,
    options: FormatOptions,
  ): Promise<?{
    newCursor?: number,
    formatted: string,
  }> {
    await this.ensureServer(fileVersion.filePath);
    return this._service.formatEntireFile(fileVersion, range, options);
  }

  async getEvaluationExpression(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    await this.ensureServer(fileVersion.filePath);
    return this._service.getEvaluationExpression(fileVersion, position);
  }

  async getProjectRoot(filePath: NuclideUri): Promise<?NuclideUri> {
    await this.ensureServer(filePath);
    await this._service.getProjectRoot(filePath);
  }

  async isFileInProject(filePath: NuclideUri): Promise<boolean> {
    await this.ensureServer(filePath);
    return this._service.isFileInProject(filePath);
  }

  observeDiagnostics(): ConnectableObservable<FileDiagnosticMap> {
    return this._service.observeDiagnostics();
  }

  async typeHint(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?TypeHint> {
    await this.ensureServer(fileVersion.filePath);
    return this._service.typeHint(fileVersion, position);
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

  async getExpandedSelectionRange(
    fileVersion: FileVersion,
    currentSelection: atom$Range,
  ): Promise<?atom$Range> {
    return this._service.getExpandedSelectionRange(
      fileVersion,
      currentSelection,
    );
  }

  async getCollapsedSelectionRange(
    fileVersion: FileVersion,
    currentSelection: atom$Range,
    originalCursorPosition: atom$Point,
  ): Promise<?atom$Range> {
    return this._service.getCollapsedSelectionRange(
      fileVersion,
      currentSelection,
      originalCursorPosition,
    );
  }
}

async function getConnection(connection): Promise<LanguageService> {
  const [fileNotifier, host] = await Promise.all([
    getNotifierByConnection(connection),
    getHostServices(),
  ]);
  const service = getClangdLSPServiceByConnection(connection);
  const clangdService = await service.createClangdService({
    fileNotifier,
    host,
    logCategory: 'clangd-language-server',
    logLevel: 'ALL', // TODO pelmers: change to WARN
  });
  if (clangdService) {
    return new ClangdLSPClient(clangdService);
  } else {
    return new NullLanguageService();
  }
}

class Activation {
  _languageService: ?AtomLanguageService<LanguageService>;
  _subscriptions: UniversalDisposable;

  constructor(state: ?mixed) {
    this._subscriptions = new UniversalDisposable();
    passesGK(FB_CLANGD_LSP_GK).then(passes => {
      if (passes && !this._subscriptions.disposed) {
        this._subscriptions.add(this.initializeLsp());
      }
    });
  }

  consumeClangConfigurationProvider(
    provider: ClangConfigurationProvider,
  ): IDisposable {
    return registerClangProvider(provider);
  }

  initializeLsp(): IDisposable {
    const atomConfig: AtomLanguageServiceConfig = {
      name: 'clangd',
      grammars: ['source.cpp', 'source.c'],
      autocomplete: {
        version: '2.0.0',
        inclusionPriority: 1,
        suggestionPriority: 3,
        disableForSelector: null,
        excludeLowerPriority: false,
        autocompleteCacherConfig: {
          updateResults: updateAutocompleteResults,
          updateFirstResults: updateAutocompleteFirstResults,
        },
        analyticsEventName: 'clangd.getAutocompleteSuggestions',
        onDidInsertSuggestionAnalyticsEventName: 'clangd.autocomplete-chosen',
      },
      definition: {
        version: '0.1.0',
        priority: 1,
        definitionEventName: 'clangd.getDefinition',
      },
      diagnostics: {
        version: '0.2.0',
        analyticsEventName: 'clangd.observe-diagnostics',
      },
      codeFormat: {
        version: '0.1.0',
        priority: 1,
        analyticsEventName: 'clangd.formatCode',
        canFormatRanges: true,
        canFormatAtPosition: false,
      },
      codeAction: {
        version: '0.1.0',
        priority: 1,
        analyticsEventName: 'clangd.getActions',
        applyAnalyticsEventName: 'clangd.applyAction',
      },
    };

    const languageService = new AtomLanguageService(
      getConnection,
      atomConfig,
      null,
      getLogger('clangd-language-server'),
    );
    languageService.activate();
    this._languageService = languageService;
    return languageService;
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}

createPackage(module.exports, Activation);
