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
import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';
import type {
  Definition,
  DefinitionQueryResult,
} from '../../nuclide-definition-service/lib/rpc-types';
import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';
import type {FindReferencesReturn} from '../../nuclide-find-references/lib/rpc-types';
import type {
  DiagnosticProviderUpdate,
  FileDiagnosticUpdate,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {FileNotifier} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {ConnectableObservable, Observable} from 'rxjs';
import type {Completion} from '../../nuclide-language-service/lib/LanguageService';
import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';

import invariant from 'assert';
import {getBufferAtVersion} from '../../nuclide-open-files-rpc';
import {FileCache} from '../../nuclide-open-files-rpc';

export type LanguageAnalyzer = {
  getDiagnostics(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?DiagnosticProviderUpdate>,

  observeDiagnostics(): Observable<FileDiagnosticUpdate>,

  getAutocompleteSuggestions(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
    activatedManually: boolean,
  ): Promise<Array<Completion>>,

  getDefinition(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult>,

  getDefinitionById(
    file: NuclideUri,
    id: string,
  ): Promise<?Definition>,

  findReferences(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?FindReferencesReturn>,

  getCoverage(
    filePath: NuclideUri,
  ): Promise<?CoverageResult>,

  getOutline(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?Outline>,

  typeHint(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?TypeHint>,

  highlight(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<Array<atom$Range>>,

  formatSource(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    range: atom$Range,
  ): Promise<?string>,

  getEvaluationExpression(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression>,

  getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri>,

  isFileInProject(fileUri: NuclideUri): Promise<boolean>,

  dispose(): void,
};

export class ServerLanguageService {
  _fileCache: FileCache;
  _analyzer: LanguageAnalyzer;

  constructor(fileNotifier: FileNotifier, analyzer: LanguageAnalyzer) {
    invariant(fileNotifier instanceof FileCache);
    this._fileCache = fileNotifier;
    this._analyzer = analyzer;
  }

  async getDiagnostics(
    fileVersion: FileVersion,
  ): Promise<?DiagnosticProviderUpdate> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    if (buffer == null) {
      return null;
    }
    return await this._analyzer.getDiagnostics(filePath, buffer);
  }

  observeDiagnostics(): ConnectableObservable<FileDiagnosticUpdate> {
    return this._analyzer.observeDiagnostics().publish();
  }

  async getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    activatedManually: boolean,
  ): Promise<Array<Completion>> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    if (buffer == null) {
      return [];
    }
    return await this._analyzer.getAutocompleteSuggestions(
      filePath, buffer, position, activatedManually);
  }

  async getDefinition(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    if (buffer == null) {
      return null;
    }
    return await this._analyzer.getDefinition(filePath, buffer, position);
  }

  getDefinitionById(
    file: NuclideUri,
    id: string,
  ): Promise<?Definition> {
    return this._analyzer.getDefinitionById(file, id);
  }

  async findReferences(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?FindReferencesReturn> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    if (buffer == null) {
      return null;
    }
    return await this._analyzer.findReferences(filePath, buffer, position);
  }

  getCoverage(
    filePath: NuclideUri,
  ): Promise<?CoverageResult> {
    return this._analyzer.getCoverage(filePath);
  }

  async getOutline(
    fileVersion: FileVersion,
  ): Promise<?Outline> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    if (buffer == null) {
      return null;
    }
    return await this._analyzer.getOutline(filePath, buffer);
  }

  async typeHint(fileVersion: FileVersion, position: atom$Point): Promise<?TypeHint> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    if (buffer == null) {
      return null;
    }
    return await this._analyzer.typeHint(filePath, buffer, position);
  }

  async highlight(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<Array<atom$Range>> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    if (buffer == null) {
      return [];
    }
    return await this._analyzer.highlight(filePath, buffer, position);
  }

  async formatSource(
    fileVersion: FileVersion,
    range: atom$Range,
  ): Promise<?string> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    if (buffer == null) {
      return null;
    }
    return await this._analyzer.formatSource(filePath, buffer, range);
  }

  async getEvaluationExpression(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    if (buffer == null) {
      return null;
    }
    return await this._analyzer.getEvaluationExpression(filePath, buffer, position);
  }

  getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri> {
    return this._analyzer.getProjectRoot(fileUri);
  }

  async isFileInProject(fileUri: NuclideUri): Promise<boolean> {
    return this._analyzer.isFileInProject(fileUri);
  }

  dispose(): void {
    this._analyzer.dispose();
  }
}
