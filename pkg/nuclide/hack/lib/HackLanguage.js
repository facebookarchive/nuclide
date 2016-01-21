'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';
import type {
  HackCompletionsResult,
  HackCompletion,
  HackDiagnosticsResult,
  HackDiagnostic,
  HackDefinitionResult,
  HackSearchPosition,
  HackReferencesResult,
} from '../../hack-base/lib/HackService';

import type {HackSymbolNameResult} from '../../hack-base/lib/types';

import {parse, createRemoteUri, getPath} from '../../remote-uri';
import {getHackService} from './utils';
import {getLogger} from '../../logging';
import {array} from '../../commons';
import {Range, Emitter} from 'atom';
import HackWorker from './HackWorker';
import {CompletionType, SymbolType} from '../../hack-common';

// The word char regex include \ to search for namespaced classes.
const wordCharRegex = /[\w\\]/;
// The xhp char regex include : and - to match xhp tags like <ui:button-group>.
const xhpCharRegex = /[\w:-]/;
const XHP_LINE_TEXT_REGEX = /<([a-z][a-z0-9_.:-]*)[^>]*\/?>/gi;

const UPDATE_DEPENDENCIES_INTERVAL_MS = 10000;
const DEPENDENCIES_LOADED_EVENT = 'dependencies-loaded';
const MAX_HACK_WORKER_TEXT_SIZE = 10000;

/**
 * The HackLanguage is the controller that servers language requests by trying to get worker results
 * and/or results from HackService (which would be executing hh_client on a supporting server)
 * and combining and/or selecting the results to give back to the requester.
 */
module.exports = class HackLanguage {

  _hhAvailable: boolean;
  _hackWorker: HackWorker;
  _pathContentsMap: Map<string, string>;
  _basePath: ?string;
  _initialFileUri: NuclideUri;
  _isFinishedLoadingDependencies: boolean;
  _emitter: Emitter;
  _updateDependenciesInterval: number;

  /**
   * `basePath` should be the directory where the .hhconfig file is located.
   * It should only be null if client is null.
   */
  constructor(hhAvailable: boolean, basePath: ?string, initialFileUri: NuclideUri) {
    this._hhAvailable = hhAvailable;
    this._hackWorker = new HackWorker();
    this._pathContentsMap = new Map();
    this._basePath = basePath;
    this._initialFileUri = initialFileUri;
    this._isFinishedLoadingDependencies = true;
    this._emitter = new Emitter();

    if (this._hhAvailable) {
      this._setupUpdateDependenciesInterval();
    }
  }

  _setupUpdateDependenciesInterval() {
    // Fetch any dependencies the HackWorker needs after learning about this file.
    // We don't block any realtime logic on the dependency fetching - it could take a while.
    let pendingUpdateDependencies = false;

    const finishUpdateDependencies = () => {
      pendingUpdateDependencies = false;
    };

    this._updateDependenciesInterval = setInterval(() => {
      if (pendingUpdateDependencies) {
        return;
      }
      pendingUpdateDependencies = true;
      this.updateDependencies().then(finishUpdateDependencies, finishUpdateDependencies);
    }, UPDATE_DEPENDENCIES_INTERVAL_MS);
  }

  dispose() {
    this._hackWorker.dispose();
    clearInterval(this._updateDependenciesInterval);
  }

  async getCompletions(
    filePath: NuclideUri,
    contents: string,
    offset: number
  ): Promise<Array<any>> {
    // Calculate the offset of the cursor from the beginning of the file.
    // Then insert AUTO332 in at this offset. (Hack uses this as a marker.)
    const markedContents = contents.substring(0, offset) +
        'AUTO332' + contents.substring(offset, contents.length);
    const localPath = getPath(filePath);
    await this.updateFile(localPath, markedContents);
    const webWorkerMessage = {cmd: 'hh_auto_complete', args: [localPath]};
    const response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    const completionType = getCompletionType(response.completion_type);
    let {completions} = response;
    if (shouldDoServerCompletion(completionType) || !completions.length) {
      const {getCompletions} = getHackService(filePath);
      const completionsResult = await getCompletions(filePath, markedContents);
      if (completionsResult) {
        completions = ((completionsResult: any): HackCompletionsResult).completions;
      }
    }
    return processCompletions(completions);
  }

  async updateFile(path: string, contents: string): Promise {
    if (contents !== this._pathContentsMap.get(path)) {
      this._pathContentsMap.set(path, contents);
      const webWorkerMessage = {cmd: 'hh_add_file', args: [path, contents]};
      this._isFinishedLoadingDependencies = false;
      return await this._hackWorker.runWorkerTask(webWorkerMessage);
    }
  }

  async updateDependencies(): Promise {
    const webWorkerMessage = {cmd: 'hh_get_deps', args: []};
    const response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    if (!response.deps.length) {
      if (!this._isFinishedLoadingDependencies) {
        this._emitter.emit(DEPENDENCIES_LOADED_EVENT);
      }
      this._isFinishedLoadingDependencies = true;
      return;
    }

    this._isFinishedLoadingDependencies = false;
    const {getDependencies} = getHackService(this._initialFileUri);
    const dependenciesResult = await getDependencies(
      this._initialFileUri, response.deps
    );
    if (!dependenciesResult) {
      return;
    }
    const {dependencies} = dependenciesResult;
    // Serially update depednecies not to block the worker from serving other feature requests.
    /* eslint-disable babel/no-await-in-loop */
    for (const [filePath, contents] of dependencies) {
      await this.updateDependency(filePath, contents);
    }
    /* eslint-enable babel/no-await-in-loop */
  }

  async updateDependency(path: string, contents: string): Promise {
    if (contents !== this._pathContentsMap.get(path)) {
      const webWorkerMessage = {cmd: 'hh_add_dep', args: [path, contents]};
      await this._hackWorker.runWorkerTask(webWorkerMessage, {isDependency: true});
    }
  }

  /**
   * A simple way to estimate if all Hack dependencies have been loaded.
   * This flag is turned off when a file gets updated or added, and gets turned back on
   * once `updateDependencies()` returns no additional dependencies.
   *
   * The flag only updates every UPDATE_DEPENDENCIES_INTERVAL_MS, so it's not perfect -
   * however, it should be good enough for loading indicators / warnings.
   */
  isFinishedLoadingDependencies(): boolean {
    return this._isFinishedLoadingDependencies;
  }

  onFinishedLoadingDependencies(callback: (() => mixed)): atom$Disposable {
    return this._emitter.on(DEPENDENCIES_LOADED_EVENT, callback);
  }

  async formatSource(
    contents: string,
    startPosition: number,
    endPosition: number,
  ): Promise<string> {
    const webWorkerMessage = {cmd: 'hh_format', args: [contents, startPosition, endPosition]};
    const response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    const errorMessage = response.error_message;
    if (errorMessage) {
      if (errorMessage === 'Php_or_decl') {
        throw new Error('Sorry, PHP and <?hh //decl are not supported');
      } else if (errorMessage === 'Parsing_error') {
        throw new Error('Parsing Error! Fix your file so the syntax is valid and retry');
      } else {
        throw new Error('failed formating hack code' + errorMessage);
      }
    } else {
      return response.result;
    }
  }

  async highlightSource(
    path: string,
    contents: string,
    line: number,
    col: number,
  ): Promise<Array<atom$Range>> {
    await this.updateFile(path, contents);
    const webWorkerMessage = {cmd: 'hh_find_lvar_refs', args: [path, line, col]};
    const response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    return response.positions.map(
      position => new Range(
        [position.line - 1, position.char_start - 1],
        [position.line - 1, position.char_end],
      )
    );
  }

  async getDiagnostics(
    path: string,
    contents: string,
  ): Promise<Array<{message: HackDiagnostic;}>> {
    await this.updateFile(path, contents);
    const webWorkerMessage = {cmd: 'hh_check_file', args: [path]};
    const {errors} = await this._hackWorker.runWorkerTask(webWorkerMessage);
    return errors;
  }

  async getServerDiagnostics(
    filePath: NuclideUri,
  ): Promise<Array<{message: HackDiagnostic;}>> {
    const {getDiagnostics} = getHackService(filePath);
    let diagnosticResult = null;
    try {
      diagnosticResult = await getDiagnostics(filePath, '');
    } catch (err) {
      getLogger().error(err);
      return [];
    }
    if (!diagnosticResult) {
      getLogger().error('hh_client could not be reached');
      return [];
    }
    const hackDiagnostics = ((diagnosticResult: any): HackDiagnosticsResult);
    return hackDiagnostics.messages;
  }

  async getDefinition(
      filePath: NuclideUri,
      contents: string,
      lineNumber: number,
      column: number,
      lineText: string
    ): Promise<Array<HackSearchPosition>> {
    // Ask the `hh_server` to parse, indentiy the position,
    // and lookup that identifier for a location match.
    const identifierResult = await this._getDefinitionFromIdentifier(
      filePath,
      contents,
      lineNumber,
      column,
      lineText,
    );
    if (identifierResult.length === 1) {
      return identifierResult;
    }
    const heuristicResults =
      await Promise.all([
        // Ask the `hh_server` for a symbol name search location.
        this._getDefinitionFromSymbolName(filePath, contents, lineNumber, column),
        // Ask the `hh_server` for a search of the string parsed.
        this._getDefinitionFromStringParse(filePath, lineText, column),
        // Ask Hack client side for a result location.
        this._getDefinitionLocationAtPosition(filePath, contents, lineNumber, column),
      ]);
    // We now have results from all 4 sources.
    // Choose the best results to show to the user.
    const definitionResults = [identifierResult].concat(heuristicResults);
    return array.find(definitionResults, definitionResult => definitionResult.length === 1)
      || array.find(definitionResults, definitionResult => definitionResult.length > 1)
      || [];
  }

  async getSymbolNameAtPosition(
    path: string,
    contents: string,
    lineNumber: number,
    column: number
  ): Promise<?HackSymbolNameResult> {

    await this.updateFile(path, contents);
    const webWorkerMessage = {cmd: 'hh_get_method_name', args: [path, lineNumber, column]};
    const response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    if (!response.name) {
      return null;
    }
    const symbolType = getSymbolType(response.result_type);
    const position = response.pos;
    return {
      name: response.name,
      type: symbolType,
      line: position.line - 1,
      column: position.char_start - 1,
      length: position.char_end - position.char_start + 1,
    };
  }

  /**
   * A thin wrapper around getSymbolNameAtPosition that waits for dependencies before reporting
   * that no symbol name can be resolved.
   */
  async getSymbolNameAtPositionWithDependencies(
    path: string,
    contents: string,
    lineNumber: number,
    column: number,
    timeout: ?number,
  ): Promise<?HackSymbolNameResult> {
    return this._waitForDependencies(
      () => this.getSymbolNameAtPosition(path, contents, lineNumber, column),
      x => x != null,
      timeout,
    );
  }

  async _getDefinitionFromSymbolName(
    filePath: NuclideUri,
    contents: string,
    lineNumber: number,
    column: number
  ): Promise<Array<HackSearchPosition>> {
    if (contents.length > MAX_HACK_WORKER_TEXT_SIZE) {
      // Avoid Poor Worker Performance for large files.
      return [];
    }
    let symbol = null;
    try {
      symbol = await this.getSymbolNameAtPosition(getPath(filePath), contents, lineNumber, column);
    } catch (err) {
      // Ignore the error.
      getLogger().warn('_getDefinitionFromSymbolName error:', err);
      return [];
    }
    if (!symbol || !symbol.name) {
      return [];
    }
    const {getDefinition} = getHackService(filePath);
    const definitionResult = await getDefinition(filePath, symbol.name, symbol.type);
    if (!definitionResult) {
      return [];
    }
    return ((definitionResult: any): HackDefinitionResult).definitions;
  }

  async _getDefinitionLocationAtPosition(
      filePath: NuclideUri,
      contents: string,
      lineNumber: number,
      column: number,
    ): Promise<Array<HackSearchPosition>> {
    if (!filePath || contents.length > MAX_HACK_WORKER_TEXT_SIZE) {
      // Avoid Poor Worker Performance for large files.
      return [];
    }
    const {hostname, port, path: localPath} = parse(filePath);
    await this.updateFile(localPath, contents);
    const webWorkerMessage = {cmd: 'hh_infer_pos', args: [localPath, lineNumber, column]};
    const response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    const position = response.pos || {};
    if (!position.filename) {
      return [];
    }
    return [{
      path: (hostname && port)
        ? createRemoteUri(hostname, parseInt(port, 10), position.filename)
        : position.filename,
      line: position.line - 1,
      column: position.char_start - 1,
      length: position.char_end - position.char_start + 1,
      name: position.name,
      scope: position.scope,
      additionalInfo: position.additionalInfo,
    }];
  }

  async _getDefinitionFromIdentifier(
      filePath: NuclideUri,
      contents: string,
      lineNumber: number,
      column: number,
      lineText: string,
  ): Promise<Array<HackSearchPosition>> {
    const {getIdentifierDefinition} = getHackService(filePath);
    const definitionResult = await getIdentifierDefinition(
      filePath, contents, lineNumber, column
    );
    if (!definitionResult) {
      return [];
    }
    const {definitions} = ((definitionResult: any): HackDefinitionResult);
    return definitions.map(definition => {
      let {name} = definition;
      if (name.startsWith(':')) {
        // XHP class name, usages omit the leading ':'.
        name = name.substring(1);
      }
      const definitionIndex = lineText.indexOf(name);
      if (
        definitionIndex === -1 ||
        definitionIndex >= column ||
        !xhpCharRegex.test(lineText.substring(definitionIndex, column))
      ) {
        return definition;
      } else {
        return {
          ...definition,
          searchStartColumn: definitionIndex,
          searchEndColumn: definitionIndex + definition.name.length,
        };
      }
    });
  }

  async _getDefinitionFromStringParse(
    filePath: NuclideUri,
    lineText: string,
    column: number
  ): Promise<Array<HackSearchPosition>> {
    const {search, start, end} = this._parseStringForExpression(lineText, column);
    if (!search) {
      return [];
    }
    const {getDefinition} = getHackService(filePath);
    const definitionResult = await getDefinition(filePath, search, SymbolType.UNKNOWN);
    if (!definitionResult) {
      return [];
    }
    const definitions = ((definitionResult: any): HackDefinitionResult).definitions;
    return definitions.map(definition => ({
      ...definition,
      searchStartColumn: start,
      searchEndColumn: end,
    }));
  }

  _parseStringForExpression(
    lineText: string,
    column: number,
  ): {search: string; start: number; end: number} {
    let search = null;
    let start = column;

    let isXHP = false;
    let xhpMatch;
    while  (xhpMatch = XHP_LINE_TEXT_REGEX.exec(lineText)) {
      const xhpMatchIndex = xhpMatch.index + 1;
      if (column >= xhpMatchIndex && column < (xhpMatchIndex + xhpMatch[1].length)) {
        isXHP = true;
        break;
      }
    }

    const syntaxCharRegex = isXHP ? xhpCharRegex : wordCharRegex;
    // Scan for the word start for the hack variable, function or xhp tag
    // we are trying to get the definition for.
    while (start >= 0 && syntaxCharRegex.test(lineText.charAt(start))) {
      start--;
    }
    if (lineText[start] === '$') {
      start--;
    }
    start++;
    let end = column;
    while (syntaxCharRegex.test(lineText.charAt(end))) {
      end++;
    }
    search = lineText.substring(start, end);
    // XHP UI elements start with : but the usages doesn't have that colon.
    if (isXHP && !search.startsWith(':')) {
      search = ':' + search;
    }
    return {search, start, end};
  }

  async getType(
    path: string,
    contents: string,
    expression: string,
    lineNumber: number,
    column: number,
  ): Promise<?string> {
    if (!expression.startsWith('$')) {
      return null;
    }
    await this.updateFile(path, contents);
    const webWorkerMessage = {cmd: 'hh_infer_type', args: [path, lineNumber, column]};
    const {type} = await this._hackWorker.runWorkerTask(webWorkerMessage);
    return type;
  }

  async getReferences(
    filePath: NuclideUri,
    contents: string,
    symbol: HackSymbolNameResult,
  ): Promise<?HackReferencesResult> {
    const {getReferences} = getHackService(filePath);
    const referencesResult = await getReferences(filePath, symbol.name, symbol.type);
    return ((referencesResult: any): HackReferencesResult);
  }

  getBasePath(): ?string {
    return this._basePath;
  }

  isHackAvailable(): boolean {
    return this._hhAvailable;
  }

  /**
   * Continually retries the function provided until either:
   * 1) the return value is "acceptable" (if provided)
   * 2) dependencies have finished loading, or
   * 3) the specified timeout has been reached.
   */
  async _waitForDependencies<T>(
    func: (() => Promise<T>),
    acceptable: ?((value: T) => boolean),
    timeoutMs: ?number,
  ): Promise<T> {
    const startTime = Date.now();
    while (!timeoutMs || Date.now() - startTime < timeoutMs) {
      const result = await func();
      if ((acceptable && acceptable(result)) || this.isFinishedLoadingDependencies()) {
        return result;
      }
      // Wait for dependencies to finish loading - to avoid polling, we'll wait for the callback.
      await new Promise(resolve => {
        const subscription = this.onFinishedLoadingDependencies(() => {
          subscription.dispose();
          resolve();
        });
      });
    }
    throw new Error('Timed out waiting for Hack dependencies');
  }

};

const stringToCompletionType = {
  'id': CompletionType.ID,
  'new': CompletionType.NEW,
  'type': CompletionType.TYPE,
  'class_get': CompletionType.CLASS_GET,
  'var': CompletionType.VAR,
};

function getCompletionType(input: string) {
  let completionType = stringToCompletionType[input];
  if (typeof completionType === 'undefined') {
    completionType = CompletionType.NONE;
  }
  return completionType;
}

const stringToSymbolType = {
  'class': SymbolType.CLASS,
  'function': SymbolType.FUNCTION,
  'method': SymbolType.METHOD,
  'local': SymbolType.LOCAL,
};

function getSymbolType(input: string) {
  let symbolType = stringToSymbolType[input];
  if (typeof symbolType === 'undefined') {
    symbolType = SymbolType.METHOD;
  }
  return symbolType;
}

const serverCompletionTypes = new Set([
  CompletionType.ID,
  CompletionType.NEW,
  CompletionType.TYPE,
]);

function shouldDoServerCompletion(type: number): boolean {
  return serverCompletionTypes.has(type);
}

function processCompletions(completionsResponse: Array<HackCompletion>): Array<any> {
  return completionsResponse.map(completion => {
    let {name, type, func_details: functionDetails} = completion;
    if (type && type.indexOf('(') === 0 && type.lastIndexOf(')') === type.length - 1) {
      type = type.substring(1, type.length - 1);
    }
    let matchSnippet = name;
    if (functionDetails) {
      const {params} = functionDetails;
      // Construct the snippet: e.g. myFunction(${1:$arg1}, ${2:$arg2});
      const paramsString = params.map((param, index) => '${' + (index + 1) + ':' + param.name + '}').join(', ');
      matchSnippet = name + '(' + paramsString + ')';
    }
    return {
      matchSnippet,
      matchText: name,
      matchType: type,
    };
  });
}
