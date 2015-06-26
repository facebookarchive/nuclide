'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Range} = require('atom');
var HackWorker = require('./HackWorker');
var {CompletionType, SymbolType} = require('nuclide-hack-common/lib/constants');
var logger = require('nuclide-logging').getLogger();
// The word char regex include \ to search for namespaced classes.
var wordCharRegex = /[\w\\]/;
// The xhp char regex include : and - to match xhp tags like <ui:button-group>.
var xhpCharRegex = /[\w:-]/;
var XHP_LINE_TEXT_REGEX = /<([a-z][a-z0-9_.:-]*)[^>]*\/?>/gi;

const UPDATE_DEPENDENCIES_INTERVAL_MS = 10000;

/**
 * The HackLanguage is the controller that servers language requests by trying to get worker results
 * and/or results from HackService (which would be executing hh_client on a supporting server)
 * and combining and/or selecting the results to give back to the requester.
 */
module.exports = class HackLanguage {

  constructor(client: NuclideClient) {
    this._hackWorker = new HackWorker();
    this._client = client;
    this._pathContentsMap = {};

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
      completions = await this._client.getHackCompletions(markedContents);
    }
    return processCompletions(completions);
  }

  async updateFile(path: string, contents: string): Promise {
    if (contents !== this._pathContentsMap[path]) {
      this._pathContentsMap[path] = contents;
      var webWorkerMessage = {cmd: 'hh_add_file', args: [path, contents]};
      return await this._hackWorker.runWorkerTask(webWorkerMessage);
    }
  }

  async updateDependencies(): Promise {
      var webWorkerMessage = {cmd: 'hh_get_deps', args: []};
      var response = await this._hackWorker.runWorkerTask(webWorkerMessage);
      if (!response.deps.length) {
        return;
      }
      var dependencies = {};
      try {
        dependencies = await this._client.getHackDependencies(response.deps);
      } catch (err) {
        // Ignore the error, it's just dependency fetching.
        logger.warn('getHackDependencies error:', err);
      }
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

  async formatSource(contents: string, startPosition: number, endPosition: number) {
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
    var response = await this._client.getHackDiagnostics();
    return parseErrorsFromResponse(response);
  }

  async getDefinition(
      path: string,
      contents: string,
      lineNumber: number,
      column: number,
      lineText: string
    ): Promise<Array<any>> {

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
    var webWorkerMessage = {cmd: 'hh_get_method_name', args: [path, lineNumber - 1, column - 1]};
    var response = await this._hackWorker.runWorkerTask(webWorkerMessage);
    if (!response.name) {
      return null;
    }
    var symbolType = getSymbolType(response.result_type);
    var position = response.pos;
    return {
      name: response.name,
      type: symbolType,
      line: position.line,
      column: position.char_start,
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
        defs = await this._client.getHackDefinition(symbol.name, symbol.type);
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
    var defs = [];
    try {
      defs = await this._client.getHackDefinition(search, SymbolType.UNKNOWN);
    } catch (err) {
      // ignore the error
      logger.warn('_getDefinitionFromStringParse error:', err);
    }
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

  _parseStringForExpression(lineText: string, column: number): string {
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

  async getType(path: string, contents: string, expression: string, lineNumber: number, column: number): ?string {
    if (!isHackFile(contents) || !expression.startsWith('$')) {
      return null;
    }
    await this.updateFile(path, contents);
    var webWorkerMessage = {cmd: 'hh_infer_type', args: [path, lineNumber, column]};
    var {type} = await this._hackWorker.runWorkerTask(webWorkerMessage);
    return type;
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

function parseErrorsFromResponse(response: any): Array<any> {
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

function shouldDoServerCompletion(type: CompletionType): boolean {
  return serverCompletionTypes.has(type);
}

function processCompletions(completionsResponse: Array<any>): Array<any> {
  return completionsResponse.map((completion) => {
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
  return contents && contents.startsWith('<?hh');
}
