'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
import type {AutocompleteConfig} from './AutocompleteProvider';
import type {DiagnosticsConfig} from './DiagnosticsProvider';

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

export type AtomLanguageServiceConfig = {
  name: string,
  grammars: Array<string>,
  highlights?: CodeHighlightConfig,
  outlines?: OutlineViewConfig,
  coverage?: TypeCoverageConfig,
  definition?: DefinitionConfig,
  typeHint?: TypeHintConfig,
  codeFormat?: CodeFormatConfig,
  findReferences?: FindReferencesConfig,
  evaluationExpression?: EvaluationExpressionConfig,
  autocomplete?: AutocompleteConfig,
  diagnostics?: DiagnosticsConfig,
};

export class AtomLanguageService<T: LanguageService> {
  _config: AtomLanguageServiceConfig;
  _connectionToLanguageService: ConnectionCache<T>;
  _subscriptions: UniversalDisposable;

  constructor(
    languageServiceFactory: (connection: ?ServerConnection) => Promise<T>,
    config: AtomLanguageServiceConfig,
  ) {
    this._config = config;
    this._subscriptions = new UniversalDisposable();
    const lazy = true;
    this._connectionToLanguageService = new ConnectionCache(languageServiceFactory, lazy);
    this._subscriptions.add(this._connectionToLanguageService);
  }

  _selector(): string {
    return this._config.grammars.join(', ');
  }

  activate(): void {
    const highlightsConfig = this._config.highlights;
    if (highlightsConfig != null) {
      this._subscriptions.add(CodeHighlightProvider.register(
        this._config.name,
        this._selector(),
        highlightsConfig,
        this._connectionToLanguageService));
    }

    const outlinesConfig = this._config.outlines;
    if (outlinesConfig != null) {
      this._subscriptions.add(OutlineViewProvider.register(
        this._config.name, this._selector(), outlinesConfig, this._connectionToLanguageService));
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
        this._config.name, this._selector(), codeFormatConfig, this._connectionToLanguageService));
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
        this._connectionToLanguageService));
    }

    const diagnosticsConfig = this._config.diagnostics;
    if (diagnosticsConfig != null) {
      this._subscriptions.add(registerDiagnostics(
        this._config.name,
        this._config.grammars,
        diagnosticsConfig,
        this._connectionToLanguageService));
    }
  }

  async getLanguageServiceForUri(fileUri: ?NuclideUri): Promise<?T> {
    const result = this._connectionToLanguageService.getForUri(fileUri);
    return (result == null) ? null : await result;
  }

  async isFileInProject(fileUri: NuclideUri): Promise<boolean> {
    const languageService = this._connectionToLanguageService.getExistingForUri(fileUri);
    if (languageService == null) {
      return false;
    }
    return await (await languageService).isFileInProject(fileUri);
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
