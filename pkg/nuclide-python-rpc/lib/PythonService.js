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
import type {MessageType} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {LanguageService} from '../../nuclide-language-service/lib/LanguageService';
import type {FileNotifier} from '../../nuclide-open-files-rpc/lib/rpc-types';
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
import type {AutocompleteResult} from '../../nuclide-language-service/lib/LanguageService';
import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';
import type {ConnectableObservable} from 'rxjs';

import invariant from 'assert';
import {asyncExecute} from '../../commons-node/process';
import {maybeToString} from '../../commons-node/string';
import fsPromise from '../../commons-node/fsPromise';
import nuclideUri from '../../commons-node/nuclideUri';
import JediServerManager from './JediServerManager';
import {parseFlake8Output} from './flake8';
import {ServerLanguageService} from '../../nuclide-language-service-rpc';
import {itemsToOutline} from './outline';
import {Point, Range} from 'simple-text-buffer';
import {FileCache} from '../../nuclide-open-files-rpc';
import {getAutocompleteSuggestions} from './AutocompleteHelpers';
import {getDefinition} from './DefinitionHelpers';

export type PythonCompletion = {
  type: string,
  text: string,
  description?: string,
  params?: Array<string>,
};

export type PythonDefinition = {
  type: string,
  text: string,
  file: NuclideUri,
  line: number,
  column: number,
};

export type PythonReference = {
  type: string,
  text: string,
  file: NuclideUri,
  line: number,
  column: number,
  parentName?: string,
};

export type Position = {
  line: number,
  column: number,
};

export type PythonFunctionItem = {
  kind: 'function',
  name: string,
  start: Position,
  end: Position,
  children?: Array<PythonOutlineItem>,
  docblock?: string,
  params?: Array<string>,
};

export type PythonClassItem = {
  kind: 'class',
  name: string,
  start: Position,
  end: Position,
  children?: Array<PythonOutlineItem>,
  docblock?: string,
  // Class params, i.e. superclasses.
  params?: Array<string>,
};

export type PythonStatementItem = {
  kind: 'statement',
  name: string,
  start: Position,
  end: Position,
  docblock?: string,
};

export type PythonOutlineItem = PythonFunctionItem | PythonClassItem | PythonStatementItem;

export type PythonDiagnostic = {
  file: NuclideUri,
  code: string,
  message: string,
  type: MessageType,
  line: number,
  column: number,
};

export type PythonServiceConfig = {
  showGlobalVariables: boolean,
  autocompleteArguments: boolean,
  includeOptionalArguments: boolean,
};

const serverManager = new JediServerManager();

export async function initialize(
  fileNotifier: FileNotifier,
  config: PythonServiceConfig,
): Promise<LanguageService> {
  return new ServerLanguageService(
    fileNotifier,
    new PythonSingleFileLanguageService(
      fileNotifier,
      config,
    ),
  );
}

class PythonSingleFileLanguageService {
  _fileCache: FileCache;
  _showGlobalVariables: boolean;
  _autocompleteArguments: boolean;
  _includeOptionalArguments: boolean;

  constructor(
    fileNotifier: FileNotifier,
    config: PythonServiceConfig,
  ) {
    invariant(fileNotifier instanceof FileCache);
    this._fileCache = fileNotifier;
    this._showGlobalVariables = config.showGlobalVariables;
    this._autocompleteArguments = config.autocompleteArguments;
    this._includeOptionalArguments = config.includeOptionalArguments;
  }

  getDiagnostics(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?DiagnosticProviderUpdate> {
    throw new Error('Not Yet Implemented');
  }

  observeDiagnostics(): ConnectableObservable<FileDiagnosticUpdate> {
    throw new Error('Not Yet Implemented');
  }

  getAutocompleteSuggestions(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
    activatedManually: boolean,
  ): Promise<AutocompleteResult> {
    return getAutocompleteSuggestions(
      serverManager,
      filePath,
      buffer,
      position,
      activatedManually,
      this._autocompleteArguments,
      this._includeOptionalArguments,
    );
  }

  getDefinition(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    return getDefinition(serverManager, filePath, buffer, position);
  }

  getDefinitionById(
    file: NuclideUri,
    id: string,
  ): Promise<?Definition> {
    return Promise.resolve(null);
  }

  async findReferences(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?FindReferencesReturn> {
    const result = await getReferences(
        filePath,
        buffer.getText(),
        position.row,
        position.column,
      );

    if (!result || result.length === 0) {
      return {type: 'error', message: 'No usages were found.'};
    }

    const symbolName = result[0].text;

    // Process this into the format nuclide-find-references expects.
    const references = result.map(ref => {
      return {
        uri: ref.file,
        name: ref.parentName,
        range: new Range(
          new Point(ref.line, ref.column),
          new Point(ref.line, ref.column + ref.text.length),
        ),
      };
    });

    // Choose the project root as baseUri, or if no project exists,
    // use the dirname of the src file.
    const baseUri = this._fileCache.getContainingDirectory(filePath)
      || nuclideUri.dirname(filePath);

    return {
      type: 'data',
      baseUri,
      referencedSymbolName: symbolName,
      references,
    };
  }

  getCoverage(
    filePath: NuclideUri,
  ): Promise<?CoverageResult> {
    throw new Error('Not Yet Implemented');
  }

  async getOutline(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?Outline> {
    const service = await serverManager.getJediService(filePath);
    const items = await service.get_outline(filePath, buffer.getText());

    if (items == null) {
      return null;
    }

    const mode = this._showGlobalVariables ? 'all' : 'constants';
    return {
      outlineTrees: itemsToOutline(mode, items),
    };
  }

  typeHint(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?TypeHint> {
    throw new Error('Not Yet Implemented');
  }

  highlight(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?Array<atom$Range>> {
    throw new Error('Not Yet Implemented');
  }

  formatSource(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    range: atom$Range,
  ): Promise<?string> {
    throw new Error('Not Yet Implemented');
  }

  async formatEntireFile(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    range: atom$Range,
  ): Promise<?{
    newCursor?: number,
    formatted: string,
  }> {
    const contents = buffer.getText();
    const start = range.start.row + 1;
    const end = range.end.row + 1;
    const libCommand = getFormatterPath();
    const dirName = nuclideUri.dirname(nuclideUri.getPath(filePath));

    const result = await asyncExecute(
      libCommand,
      ['--line', `${start}-${end}`],
      {cwd: dirName, stdin: contents},
    );

    /*
     * At the moment, yapf outputs 3 possible exit codes:
     * 0 - success, no content change.
     * 2 - success, contents changed.
     * 1 - internal failure, most likely due to syntax errors.
     *
     * See: https://github.com/google/yapf/issues/228#issuecomment-198682079
     */
    if (result.exitCode === 1) {
      throw new Error(`"${libCommand}" failed, likely due to syntax errors.`);
    } else if (result.exitCode == null) {
      throw new Error(
        `"${libCommand}" failed with error: ${maybeToString(result.errorMessage)}, ` +
        `stderr: ${result.stderr}, stdout: ${result.stdout}.`,
      );
    } else if (contents !== '' && result.stdout === '') {
      // Throw error if the yapf output is empty, which is almost never desirable.
      throw new Error('Empty output received from yapf.');
    }

    return {formatted: result.stdout};
  }

  getEvaluationExpression(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    throw new Error('Not Yet Implemented');
  }

  getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri> {
    throw new Error('Not Yet Implemented');
  }

  isFileInProject(fileUri: NuclideUri): Promise<boolean> {
    throw new Error('Not Yet Implemented');
  }

  dispose(): void {
  }
}

let formatterPath;
function getFormatterPath() {
  if (formatterPath) {
    return formatterPath;
  }

  formatterPath = 'yapf';

  try {
    // $FlowFB
    const findFormatterPath = require('./fb/find-formatter-path').default;
    const overridePath = findFormatterPath();
    if (overridePath) {
      formatterPath = overridePath;
    }
  } catch (e) {
    // Ignore.
  }

  return formatterPath;
}

export async function getReferences(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
): Promise<?Array<PythonReference>> {
  const service = await serverManager.getJediService(src);
  return service.get_references(
      src,
      contents,
      line,
      column,
    );
}

// Set to false if flake8 isn't found, so we don't repeatedly fail.
let shouldRunFlake8 = true;

export async function getDiagnostics(
  src: NuclideUri,
  contents: string,
): Promise<Array<PythonDiagnostic>> {
  if (!shouldRunFlake8) {
    return [];
  }

  const dirName = nuclideUri.dirname(src);
  const configDir = await fsPromise.findNearestFile('.flake8', dirName);
  const configPath = configDir ? nuclideUri.join(configDir, '.flake8') : null;

  let result;
  try {
    // $FlowFB
    const runFlake8 = require('./fb/run-flake8').default;
    result = await runFlake8(src, contents, configPath);
  } catch (e) {
    // Ignore.
  }

  if (!result) {
    const command =
      global.atom && atom.config.get('nuclide.nuclide-python.pathToFlake8') || 'flake8';
    const args = [];

    if (configPath) {
      args.push('--config');
      args.push(configPath);
    }

    // Read contents from stdin.
    args.push('-');

    result = await asyncExecute(command, args, {cwd: dirName, stdin: contents});
  }
  // 1 indicates unclean lint result (i.e. has errors/warnings).
  // A non-successful exit code can result in some cases that we want to ignore,
  // for example when an incorrect python version is specified for a source file.
  if (result.exitCode && result.exitCode > 1) {
    return [];
  } else if (result.exitCode == null) {
    // Don't throw if flake8 is not found on the user's system.
    if (result.errorCode === 'ENOENT') {
      // Don't retry again.
      shouldRunFlake8 = false;
      return [];
    }
    throw new Error(
      `flake8 failed with error: ${maybeToString(result.errorMessage)}, ` +
      `stderr: ${result.stderr}, stdout: ${result.stdout}`,
    );
  }
  return parseFlake8Output(src, result.stdout);
}
