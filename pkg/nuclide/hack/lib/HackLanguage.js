'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HackReference} from 'nuclide-hack-common';
/* $FlowFixMe - relative requires not supported */
import type NuclideClient from 'nuclide-server/lib/NuclideClient';

var {Range} = require('atom');
var HackWorker = require('./HackWorker');
var {CompletionType, SymbolType} = require('nuclide-hack-common');
var logger = require('nuclide-logging').getLogger();
// The word char regex include \ to search for namespaced classes.
var wordCharRegex = /[\w\\]/;
// The xhp char regex include : and - to match xhp tags like <ui:button-group>.
var xhpCharRegex = /[\w:-]/;
var XHP_LINE_TEXT_REGEX = /<([a-z][a-z0-9_.:-]*)[^>]*\/?>/gi;

var /*const*/ UPDATE_DEPENDENCIES_INTERVAL_MS = 10000;

/**
 * The HackLanguage is the controller that servers language requests by trying to get worker results
 * and/or results from HackService (which would be executing hh_client on a supporting server)
 * and combining and/or selecting the results to give back to the requester.
 */
module.exports = class HackLanguage {

  _hackWorker: HackWorker;
  _client: ?NuclideClient;
  _pathContentsMap: {[path: string]: string};
  _basePath: ?string;
  _isFinishedLoadingDependencies: boolean;
  _updateDependenciesInterval: number;

  /**
   * `basePath` should be the directory where the .hhconfig file is located.
   * It should only be null if client is null.
   */
  constructor(client: ?NuclideClient, basePath: ?string) {
    this._hackWorker = new HackWorker();
    this._client = client;
    this._pathContentsMap = {};
    this._basePath = basePath;
    this._isFinishedLoadingDependencies = true;

    this._setupUpdateDependenciesInterval();
  }

  _setupUpdateDependenciesInterval() {
    // Fetch any dependencies the HackWorker needs after learning about this file.
    // We don't block any realtime logic on the dependency fetching - it could take a while.
    var pendingUpdateDependencies = false;

    var finishUpdateDependencies = () => {
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

  async getCompletions(path: string, contents: string, offset: number): Promise<Array<any>> {
    // Calculate the offset of the cursor from the beginning of the file.
    // Then insert AUTO332 in at this offset. (Hack uses this as a marker.)
    var markedContents = contents.substring(0, offset) +
        'AUTO332' + contents.substring(offset, contents.length);
    await this.updateFile(path, markedContents);
    var webWorkerMessage = {cmd: 'hh_auto_complete', args: [path]};
    var response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    var completionType = getCompletionType(response.completion_type);
    var completions = response.completions;
    if (shouldDoServerCompletion(completionType) || !completions.length) {
      completions = await this._callHackService(
        /*serviceName*/ 'getHackCompletions',
        /*serviceArgs*/ [markedContents],
        /*defaultValue*/ [],
      );
    }
    return processCompletions(completions);
  }

  async updateFile(path: string, contents: string): Promise {
    if (contents !== this._pathContentsMap[path]) {
      this._pathContentsMap[path] = contents;
      var webWorkerMessage = {cmd: 'hh_add_file', args: [path, contents]};
      this._isFinishedLoadingDependencies = false;
      return await this._hackWorker.runWorkerTask(webWorkerMessage);
    }
  }

  async updateDependencies(): Promise {
    var webWorkerMessage = {cmd: 'hh_get_deps', args: []};
    var response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    if (!response.deps.length) {
      this._isFinishedLoadingDependencies = true;
      return;
    }

    var dependencies = await this._callHackService(
      /*serviceName*/ 'getHackDependencies',
      /*serviceArgs*/ [response.deps],
      /*defaultValue*/ {},
    );
    // Serially update depednecies not to block the worker from serving other feature requests.
    for (var path in dependencies) {
      await this.updateDependency(path, dependencies[path]);
    }
  }

  async updateDependency(path: string, contents: string): Promise {
    if (contents !== this._pathContentsMap[path]) {
      var webWorkerMessage = {cmd: 'hh_add_dep', args: [path, contents]};
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

  async formatSource(
    contents: string,
    startPosition: number,
    endPosition: number,
  ): Promise<string> {
    var webWorkerMessage = {cmd: 'hh_format', args: [contents, startPosition, endPosition]};
    var response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    var errorMessage = response.error_message;
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

  async getDiagnostics(path: string, contents: string): Promise<Array<any>> {
    if (!isHackFile(contents)) {
      return [];
    }
    await this.updateFile(path, contents);
    var webWorkerMessage = {cmd: 'hh_check_file', args: [path]};
    var response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    return parseErrorsFromResponse(response);
  }

  async getServerDiagnostics(): Promise<Array<any>> {
    var response = await this._callHackService(
      /*serviceName*/ 'getHackDiagnostics',
      /*serviceArgs*/ [],
      /*defaultValue*/ {errors: []},
    );
    return parseErrorsFromResponse(response);
  }

  async getDefinition(
      path: string,
      contents: string,
      lineNumber: number,
      column: number,
      lineText: string
    ): Promise<?Array<any>> {

    if (!isHackFile(contents)) {
      return null;
    }

    var [clientSideResults, identifyMethodResults, stringParseResults] =
      await Promise.all([
        // First Stage. Ask Hack clientside for a result location.
        this._getDefinitionLocationAtPosition(path, contents, lineNumber, column),
        // Second stage. Ask Hack clientside for the name of the symbol we're on. If we get a name,
        // ask the server for the location of this name
        this._getDefinitionFromIdentifyMethod(path, contents, lineNumber, column),
        // Third stage, do simple string parsing of the file to get a string to search the server for.
        // Then ask the server for the location of that string.
        this._getDefinitionFromStringParse(lineText, column),
      ]);
    // We now have results from all 3 sources. Chose the best results to show to the user.
    if (identifyMethodResults.length === 1) {
      return identifyMethodResults;
    } else if (stringParseResults.length === 1) {
      return stringParseResults;
    } else if (clientSideResults.length === 1) {
      return clientSideResults;
    } else if (identifyMethodResults.length > 0) {
      return identifyMethodResults;
    } else if (stringParseResults.length > 0) {
      return stringParseResults;
    } else {
      return clientSideResults;
    }
  }

  async getSymbolNameAtPosition(
      path: string,
      contents: string,
      lineNumber: number,
      column: number
    ): Promise<any> {

    await this.updateFile(path, contents);
    var webWorkerMessage = {cmd: 'hh_get_method_name', args: [path, lineNumber, column]};
    var response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    if (!response.name) {
      return null;
    }
    var symbolType = getSymbolType(response.result_type);
    var position = response.pos;
    return {
      name: response.name,
      type: symbolType,
      line: position.line - 1,
      column: position.char_start - 1,
      length: position.char_end - position.char_start + 1,
    };
  }

  async _getDefinitionLocationAtPosition(
      path: string,
      contents: string,
      lineNumber: number,
      column: number
    ): Promise<Array<any>> {

    await this.updateFile(path, contents);
    var webWorkerMessage = {cmd: 'hh_infer_pos', args: [path, lineNumber, column]};
    var response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    var position = response.pos || {};
    if (position.filename) {
      return [{
        path: position.filename,
        line: position.line - 1,
        column: position.char_start - 1,
        length: position.char_end - position.char_start + 1,
      }];
    } else {
      return [];
    }
  }

  async _getDefinitionFromIdentifyMethod(
      path: string,
      contents: string,
      lineNumber: number,
      column: number
    ): Promise<Array<any>> {

    try {
      var symbol = await this.getSymbolNameAtPosition(path, contents, lineNumber, column);
      var defs = [];
      if (symbol && symbol.name) {
        defs = await this._callHackService(
          /*serviceName*/ 'getHackDefinition',
          /*serviceArgs*/ [symbol.name, symbol.type],
          /*defaultValue*/ [],
        );
      }
      return defs;
    } catch (err) {
      // ignore the error
      logger.warn('_getDefinitionFromIdentifyMethod error:', err);
      return [];
    }
  }

  async _getDefinitionFromStringParse(lineText: string, column: number): Promise<Array<any>> {
    var {search, start, end} = this._parseStringForExpression(lineText, column);
    if (!search) {
      return [];
    }
    var defs = await this._callHackService(
      /*serviceName*/ 'getHackDefinition',
      /*serviceArgs*/ [search, SymbolType.UNKNOWN],
      /*defaultValue*/ [],
    );
    return defs.map(definition => {
      return {
        path: definition.path,
        line: definition.line,
        column: definition.column,
        searchStartColumn: start,
        searchEndColumn: end,
      };
    });
  }

  _parseStringForExpression(
    lineText: string,
    column: number,
  ): {search: string; start: number; end: number} {
    var search = null;
    var start = column;

    var isXHP = false;
    var xhpMatch;
    while  (xhpMatch = XHP_LINE_TEXT_REGEX.exec(lineText)) {
      var xhpMatchIndex = xhpMatch.index + 1;
      if (column >= xhpMatchIndex && column < (xhpMatchIndex + xhpMatch[1].length)) {
        isXHP = true;
        break;
      }
    }

    var syntaxCharRegex = isXHP ? xhpCharRegex : wordCharRegex;
    // Scan for the word start for the hack variable, function or xhp tag
    // we are trying to get the definition for.
    while (start >= 0 && syntaxCharRegex.test(lineText.charAt(start))) {
      start--;
    }
    if (lineText[start] === '$') {
      start--;
    }
    start++;
    var end = column;
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
    if (!isHackFile(contents) || !expression.startsWith('$')) {
      return null;
    }
    await this.updateFile(path, contents);
    var webWorkerMessage = {cmd: 'hh_infer_type', args: [path, lineNumber, column]};
    var {type} = await this._hackWorker.runWorkerTask(webWorkerMessage);
    return type;
  }

  async getReferences(contents: string, symbolName: string): Promise<?Array<HackReference>> {
    if (!isHackFile(contents)) {
      return null;
    }
    return await this._callHackService(
      /*serviceName*/ 'getHackReferences',
      /*serviceArgs*/ [symbolName],
      /*defaultValue*/ null,
    );
  }

  getBasePath(): ?string {
    return this._basePath;
  }

  async _callHackService(serviceName: string, serviceArgs: Array<any>, defaultValue: any): Promise<any> {
    if (!this._client) {
      // hh_client isn't available on the host machine, no service calls can be done,
      // default values are returned.
      return defaultValue;
    }
    try {
      return await this._client[serviceName].apply(this._client, serviceArgs);
    } catch (error) {
      logger.warn(`HACK: service call ${serviceName} failed with args:`, serviceArgs, error);
      atom.notifications.addWarning(error.message || error);
      return defaultValue;
    }
  }

};

var stringToCompletionType = {
  'id': CompletionType.ID,
  'new': CompletionType.NEW,
  'type': CompletionType.TYPE,
  'class_get': CompletionType.CLASS_GET,
  'var': CompletionType.VAR,
};

function getCompletionType(input: string) {
  var completionType = stringToCompletionType[input];
  if (typeof completionType === 'undefined') {
    completionType = CompletionType.NONE;
  }
  return completionType;
}

var stringToSymbolType = {
  'class': SymbolType.CLASS,
  'function': SymbolType.FUNCTION,
  'method': SymbolType.METHOD,
  'local': SymbolType.LOCAL,
};

function getSymbolType(input: string) {
  var symbolType = stringToSymbolType[input];
  if (typeof symbolType === 'undefined') {
    symbolType = SymbolType.METHOD;
  }
  return symbolType;
}

function parseErrorsFromResponse(response: {errors: Array<Object>}): Array<Object> {
  var errors = response.errors.map(error => {
    var rootCause = null;
    var errorParts = error.message;
    return errorParts.map(errorPart => {
      if (!rootCause) {
        var {start, end, line, path} = errorPart;
        start--;
        line--;
        rootCause = {
          range: new Range([line, start], [line, end]),
          path,
          start,
          line,
        };
      }
      return {
        type: 'Error',
        text: errorPart.descr,
        filePath: rootCause.path,
        range: rootCause.range,
      };
    });
  });
  // flatten the arrays
  return [].concat.apply([], errors);
}

var serverCompletionTypes = new Set([
  CompletionType.ID,
  CompletionType.NEW,
  CompletionType.TYPE,
]);

function shouldDoServerCompletion(type: number): boolean {
  return serverCompletionTypes.has(type);
}

function processCompletions(completionsResponse: Array<any>): Array<any> {
  return completionsResponse.map(completion => {
    var {name, type, func_details: functionDetails} = completion;
    if (type && type.indexOf('(') === 0 && type.lastIndexOf(')') === type.length - 1) {
      type = type.substring(1, type.length - 1);
    }
    var matchSnippet = name;
    if (functionDetails) {
      var {params} = functionDetails;
      // Construct the snippet: e.g. myFunction(${1:$arg1}, ${2:$arg2});
      var paramsString = params.map((param, index) => '${' + (index + 1) + ':' + param.name + '}').join(', ');
      matchSnippet = name + '(' + paramsString + ')';
    }
    return {
      matchSnippet,
      matchText: name,
      matchType: type,
    };
  });
}

function isHackFile(contents: string): boolean {
  return Boolean(contents) && contents.startsWith('<?hh');
}
