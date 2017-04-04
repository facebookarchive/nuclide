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
import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {TextEdit} from '../../nuclide-textedit/lib/rpc-types';
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
import type {ConnectableObservable} from 'rxjs';
import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';
import type {
  AutocompleteResult,
  SymbolResult,
} from '../../nuclide-language-service/lib/LanguageService';

import {Observable} from 'rxjs';

// An implementation of LanguageService which always returns no results.
// Useful for implementing aggregate language services.
export class NullLanguageService {
  getDiagnostics(
    fileVersion: FileVersion,
  ): Promise<?DiagnosticProviderUpdate> {
    return Promise.resolve(null);
  }

  observeDiagnostics(): ConnectableObservable<FileDiagnosticUpdate> {
    return Observable.empty().publish();
  }

  getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    activatedManually: boolean,
    prefix: string,
  ): Promise<?AutocompleteResult> {
    return Promise.resolve(null);
  }

  getDefinition(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    return Promise.resolve(null);
  }

  getDefinitionById(
    file: NuclideUri,
    id: string,
  ): Promise<?Definition> {
    return Promise.resolve(null);
  }

  findReferences(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?FindReferencesReturn> {
    return Promise.resolve(null);
  }

  getCoverage(
    filePath: NuclideUri,
  ): Promise<?CoverageResult> {
    return Promise.resolve(null);
  }

  getOutline(
    fileVersion: FileVersion,
  ): Promise<?Outline> {
    return Promise.resolve(null);
  }

  typeHint(fileVersion: FileVersion, position: atom$Point): Promise<?TypeHint> {
    return Promise.resolve(null);
  }

  highlight(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?Array<atom$Range>> {
    return Promise.resolve(null);
  }

  formatSource(
    fileVersion: FileVersion,
    range: atom$Range,
  ): Promise<?Array<TextEdit>> {
    return Promise.resolve(null);
  }

  formatEntireFile(fileVersion: FileVersion, range: atom$Range): Promise<?{
    newCursor?: number,
    formatted: string,
  }> {
    return Promise.resolve(null);
  }

  getEvaluationExpression(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    return Promise.resolve(null);
  }

  supportsSymbolSearch(
    directories: Array<NuclideUri>,
  ): Promise<boolean> {
    return Promise.resolve(false);
  }

  symbolSearch(
    query: string,
    directories: Array<NuclideUri>,
  ): Promise<?Array<SymbolResult>> {
    return Promise.resolve(null);
  }

  getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri> {
    return Promise.resolve(null);
  }

  isFileInProject(fileUri: NuclideUri): Promise<boolean> {
    return Promise.resolve(false);
  }

  dispose(): void {
  }
}
