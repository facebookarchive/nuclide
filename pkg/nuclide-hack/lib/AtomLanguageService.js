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
import type {LanguageService} from '../../nuclide-hack-rpc/lib/LanguageService';
import type {ServerConnection} from '../../nuclide-remote-connection';
import type {CodeHighlightConfig} from './CodeHighlightProvider';
import type {OutlineViewConfig} from './OutlineViewProvider';
import type {TypeCoverageConfig} from './TypeCoverageProvider';
import type {DefinitionConfig} from './DefinitionProvider';
import type {TypeHintConfig} from './TypeHintProvider';
import type {CodeFormatConfig} from './CodeFormatProvider';

import {ConnectionCache} from '../../nuclide-remote-connection';
import {Observable} from 'rxjs';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {CodeHighlightProvider} from './CodeHighlightProvider';
import {OutlineViewProvider} from './OutlineViewProvider';
import {TypeCoverageProvider} from './TypeCoverageProvider';
import {DefinitionProvider} from './DefinitionProvider';
import {TypeHintProvider} from './TypeHintProvider';
import {CodeFormatProvider} from './CodeFormatProvider';

export type AtomLanguageServiceConfig = {
  languageServiceFactory: (connection: ?ServerConnection) => Promise<LanguageService>,
  name: string,
  grammars: Array<string>,
  highlights?: CodeHighlightConfig,
  outlines?: OutlineViewConfig,
  coverage?: TypeCoverageConfig,
  definition?: DefinitionConfig,
  typeHint?: TypeHintConfig,
  codeFormat?: CodeFormatConfig,
};

export class AtomLanguageService {
  _config: AtomLanguageServiceConfig;
  _connectionToLanguageService: ConnectionCache<LanguageService>;
  _subscriptions: UniversalDisposable;

  constructor(config: AtomLanguageServiceConfig) {
    this._config = config;
    this._subscriptions = new UniversalDisposable();
    this._connectionToLanguageService = new ConnectionCache(config.languageServiceFactory);
    this._subscriptions.add(this._connectionToLanguageService);
  }

  _selector(): string {
    return this._config.grammars.join(', ');
  }

  activate(): void {
    const highlightsConfig = this._config.highlights;
    if (highlightsConfig != null) {
      this._subscriptions.add(CodeHighlightProvider.register(
        this._selector(), highlightsConfig, this._connectionToLanguageService));
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
  }

  async getLanguageServiceForUri(fileUri: ?NuclideUri): Promise<?LanguageService> {
    const result = this._connectionToLanguageService.getForUri(fileUri);
    return (result == null) ? null : await result;
  }

  async isFileInProject(fileUri: NuclideUri): Promise<bool> {
    const languageService = await this.getLanguageServiceForUri(fileUri);
    return (languageService != null) && await languageService.isFileInProject(fileUri);
  }

  observeLanguageServices(): Observable<LanguageService> {
    return this._connectionToLanguageService.observeValues()
      .switchMap(languageService => {
        return Observable.fromPromise(languageService);
      });
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}
