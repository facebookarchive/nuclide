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
import type {
  FileDiagnosticUpdate,
  DiagnosticProviderUpdate,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import {convertDiagnostics} from './DiagnosticsHelper';
import {findGraphQLConfigDir} from './config';
import {trackTiming} from '../../nuclide-analytics';

/* LanguageService related type imports */
import type {Observable} from 'rxjs';
import type {AutocompleteResult} from '../../nuclide-language-service/lib/LanguageService';
import type {TextEdit} from '../../nuclide-textedit/lib/rpc-types';
import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';
import type {
  Definition,
  DefinitionQueryResult,
} from '../../nuclide-definition-service/lib/rpc-types';
import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';
import type {FindReferencesReturn} from '../../nuclide-find-references/lib/rpc-types';
import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';

import invariant from 'assert';

import {FileCache} from '../../nuclide-open-files-rpc';
import type {FileNotifier} from '../../nuclide-open-files-rpc/lib/rpc-types';
import {ServerLanguageService} from '../../nuclide-language-service-rpc';

import {getGraphQLProcess} from './GraphQLProcess';

import {logger} from './config';

export async function initialize(
  fileNotifier: FileNotifier,
): Promise<GraphQLLanguageService> {
  return new GraphQLLanguageService(fileNotifier);
}

export class GraphQLLanguageService extends ServerLanguageService {
  constructor(fileNotifier: FileNotifier) {
    super(fileNotifier, new GraphQLLanguageAnalyzer(fileNotifier));
  }

  dispose(): void {
  }
}

class GraphQLLanguageAnalyzer {
  _fileCache: FileCache;

  constructor(fileNotifier: FileNotifier) {
    invariant(fileNotifier instanceof FileCache);
    this._fileCache = fileNotifier;
  }

  async getDiagnostics(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?DiagnosticProviderUpdate> {
    return trackTiming(
      'GraphQLLanguageAnalyzer.getDiagnostics',
      async () => {
        const graphQLProcess = await getGraphQLProcess(this._fileCache, filePath);
        if (!graphQLProcess) {
          return null;
        }

        const result = await graphQLProcess.getDiagnostics(
          buffer.getText(),
          filePath,
        );
        return convertDiagnostics(result);
      });
  }

  /**
   * Returns the root of .graphqlrc file.
   */
  getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri> {
    return findGraphQLConfigDir(fileUri);
  }

  observeDiagnostics(): Observable<FileDiagnosticUpdate> {
    throw new Error('Not implemented');
  }

  async getAutocompleteSuggestions(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
    activatedManually: boolean,
  ): Promise<AutocompleteResult> {
    return trackTiming(
      'GraphQLLanguageAnalyzer.getAutocompleteSuggestions',
      async () => {
        const graphQLProcess = await getGraphQLProcess(
          this._fileCache,
          filePath,
        );

        if (!graphQLProcess) {
          return {isIncomplete: false, items: []};
        }

        const result = await graphQLProcess.getAutocompleteSuggestions(
          buffer.getText(),
          position,
          filePath,
        );

        const items = result.map(completion => ({
          text: completion.text,
          description: completion.description || null,
          iconHTML: '<i class="icon-nuclicon-graphql"></i>',
          leftLabelHTML: completion.typeName ?
            `<span style="color: #E10098;">${completion.typeName}</span>` :
            null,
        }));
        return {
          isIncomplete: false,
          items,
        };
      },
    );
  }

  async getDefinition(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    return trackTiming(
      'GraphQLLanguageAnalyzer.getDefinition',
      async () => {
        const graphQLProcess = await getGraphQLProcess(this._fileCache, filePath);
        if (!graphQLProcess || !position) {
          logger.logError('no GraphQLProcess or position during getDefinition');
          return null;
        }
        return graphQLProcess.getDefinition(
          buffer.getText(),
          position,
          filePath,
        );
      },
    );
  }

  getDefinitionById(
    file: NuclideUri,
    id: string,
  ): Promise<?Definition> {
    throw new Error('Not implemented');
  }

  findReferences(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?FindReferencesReturn> {
    throw new Error('Not implemented');
  }

  getCoverage(
    filePath: NuclideUri,
  ): Promise<?CoverageResult> {
    throw new Error('Not implemented');
  }

  async getOutline(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?Outline> {
    return trackTiming(
      'GraphQLLanguageAnalyzer.getOutline',
      async () => {
        const graphQLProcess = await getGraphQLProcess(this._fileCache, filePath);
        if (!graphQLProcess) {
          logger.logError('no GraphQLProcess during getOutline');
          return null;
        }

        return (await graphQLProcess.getService()).getOutline(buffer.getText());
      },
    );
  }

  typeHint(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?TypeHint> {
    throw new Error('Not implemented');
  }

  highlight(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?Array<atom$Range>> {
    throw new Error('Not implemented');
  }

  formatSource(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    range: atom$Range,
  ): Promise<?Array<TextEdit>> {
    throw new Error('Not implemented');
  }

  formatEntireFile(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    range: atom$Range,
  ): Promise<?{
    newCursor?: number,
    formatted: string,
  }> {
    throw new Error('Not implemented');
  }

  getEvaluationExpression(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    throw new Error('Not implemented');
  }

  isFileInProject(fileUri: NuclideUri): Promise<boolean> {
    throw new Error('Not implemented');
  }

  dispose(): void {
  }
}
