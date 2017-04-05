/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {LanguageService} from './LanguageService';
import type {ServerConnection} from '../../nuclide-remote-connection';
import type {CodeHighlightConfig} from './CodeHighlightProvider';
import type {OutlineViewConfig} from './OutlineViewProvider';
import type {TypeCoverageConfig} from './TypeCoverageProvider';
import type {DefinitionConfig} from './DefinitionProvider';
import type {TypeHintConfig} from './TypeHintProvider';
import type {CodeFormatConfig} from './CodeFormatProvider';
import type {FindReferencesConfig} from './FindReferencesProvider';
import type {EvaluationExpressionConfig} from './EvaluationExpressionProvider';
import type {AutocompleteConfig, OnDidInsertSuggestionCallback} from './AutocompleteProvider';
import type {DiagnosticsConfig} from './DiagnosticsProvider';
import type {CategoryLogger} from '../../nuclide-logging';

import {ConnectionCache} from '../../nuclide-remote-connection';
import {Observable} from 'rxjs';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {CodeHighlightProvider} from './CodeHighlightProvider';
import {OutlineViewProvider} from './OutlineViewProvider';
import {TypeCoverageProvider} from './TypeCoverageProvider';
import {DefinitionProvider} from './DefinitionProvider';
import {TypeHintProvider} from './TypeHintProvider';
import {CodeFormatProvider} from './CodeFormatProvider';
import {FindReferencesProvider} from './FindReferencesProvider';
import {EvaluationExpressionProvider} from './EvaluationExpressionProvider';
import {AutocompleteProvider} from './AutocompleteProvider';
import {registerDiagnostics} from './DiagnosticsProvider';
import {getCategoryLogger} from '../../nuclide-logging';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {DedupedBusySignalProviderBase} from '../../nuclide-busy-signal';

export type AtomLanguageServiceConfig = {|
  name: string,
  grammars: Array<string>,
  highlight?: CodeHighlightConfig,
  outline?: OutlineViewConfig,
  coverage?: TypeCoverageConfig,
  definition?: DefinitionConfig,
  typeHint?: TypeHintConfig,
  codeFormat?: CodeFormatConfig,
  findReferences?: FindReferencesConfig,
  evaluationExpression?: EvaluationExpressionConfig,
  autocomplete?: AutocompleteConfig,
  diagnostics?: DiagnosticsConfig,
|};

export class AtomLanguageService<T: LanguageService> {
  _config: AtomLanguageServiceConfig;
  _onDidInsertSuggestion: ?OnDidInsertSuggestionCallback;
  _connectionToLanguageService: ConnectionCache<T>;
  _subscriptions: UniversalDisposable;
  _logger: CategoryLogger;

  constructor(
    languageServiceFactory: (connection: ?ServerConnection) => Promise<T>,
    config: AtomLanguageServiceConfig,
    onDidInsertSuggestion: ?OnDidInsertSuggestionCallback,
    logger: CategoryLogger = getCategoryLogger('nuclide-language-service'),
  ) {
    this._config = config;
    this._onDidInsertSuggestion = onDidInsertSuggestion;
    this._logger = logger;
    this._subscriptions = new UniversalDisposable();
    const lazy = true;
    this._connectionToLanguageService = new ConnectionCache(languageServiceFactory, lazy);
    this._subscriptions.add(this._connectionToLanguageService);
  }

  _selector(): string {
    return this._config.grammars.join(', ');
  }

  activate(): void {
    const busySignalProvider = new DedupedBusySignalProviderBase();
    this._subscriptions.add(atom.packages.serviceHub.provide(
      'nuclide-busy-signal',
      '0.1.0',
      busySignalProvider));

    const highlightConfig = this._config.highlight;
    if (highlightConfig != null) {
      this._subscriptions.add(CodeHighlightProvider.register(
        this._config.name,
        this._selector(),
        highlightConfig,
        this._connectionToLanguageService));
    }

    const outlineConfig = this._config.outline;
    if (outlineConfig != null) {
      this._subscriptions.add(OutlineViewProvider.register(
        this._config.name, this._selector(), outlineConfig, this._connectionToLanguageService));
    }

    const coverageConfig = this._config.coverage;
    if (coverageConfig != null) {
      this._subscriptions.add(TypeCoverageProvider.register(
        this._config.name, this._selector(), coverageConfig, this._connectionToLanguageService));
    }

    const definitionConfig = this._config.definition;
    if (definitionConfig != null) {
      this._subscriptions.add(DefinitionProvider.register(
        this._config.name,
        this._config.grammars,
        definitionConfig,
        this._connectionToLanguageService));
    }

    const typeHintConfig = this._config.typeHint;
    if (typeHintConfig != null) {
      this._subscriptions.add(TypeHintProvider.register(
        this._config.name, this._selector(), typeHintConfig, this._connectionToLanguageService));
    }

    const codeFormatConfig = this._config.codeFormat;
    if (codeFormatConfig != null) {
      this._subscriptions.add(CodeFormatProvider.register(
        this._config.name,
        this._selector(),
        codeFormatConfig,
        this._connectionToLanguageService,
        busySignalProvider));
    }

    const findReferencesConfig = this._config.findReferences;
    if (findReferencesConfig != null) {
      this._subscriptions.add(FindReferencesProvider.register(
        this._config.name,
        this._config.grammars,
        findReferencesConfig,
        this._connectionToLanguageService));
    }

    const evaluationExpressionConfig = this._config.evaluationExpression;
    if (evaluationExpressionConfig != null) {
      this._subscriptions.add(EvaluationExpressionProvider.register(
        this._config.name,
        this._selector(),
        evaluationExpressionConfig,
        this._connectionToLanguageService));
    }

    const autocompleteConfig = this._config.autocomplete;
    if (autocompleteConfig != null) {
      this._subscriptions.add(AutocompleteProvider.register(
        this._config.name,
        this._config.grammars,
        autocompleteConfig,
        this._onDidInsertSuggestion,
        this._connectionToLanguageService));
    }

    const diagnosticsConfig = this._config.diagnostics;
    if (diagnosticsConfig != null) {
      this._subscriptions.add(registerDiagnostics(
        this._config.name,
        this._config.grammars,
        diagnosticsConfig,
        this._logger,
        this._connectionToLanguageService,
        busySignalProvider));
    }
  }

  async getLanguageServiceForUri(fileUri: ?NuclideUri): Promise<?T> {
    return this._connectionToLanguageService.getForUri(fileUri);
  }

  async isFileInProject(fileUri: NuclideUri): Promise<boolean> {
    const languageService = this._connectionToLanguageService.getExistingForUri(fileUri);
    if (languageService == null) {
      return false;
    }
    return (await languageService).isFileInProject(fileUri);
  }

  getCachedLanguageServices(): Iterator<Promise<?T>> {
    return this._connectionToLanguageService.values();
  }

  observeLanguageServices(): Observable<T> {
    return this._connectionToLanguageService.observeValues()
      .switchMap(languageService => {
        return Observable.fromPromise(languageService);
      });
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}
