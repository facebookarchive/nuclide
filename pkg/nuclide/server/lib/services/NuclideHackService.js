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

var logger = require('nuclide-logging').getLogger();
var {SearchResultType, SymbolType} = require('nuclide-hack-common/lib/constants');
var {checkOutput, fsPromise, PromiseQueue} = require('nuclide-commons');
var extend = require('util')._extend;

const HH_NEWLINE = '<?hh\n';
const HH_STRICT_NEWLINE = '<?hh // strict\n';
const PATH_TO_HH_CLIENT = 'hh_client';
const HH_SERVER_INIT_MESSAGE = 'hh_server still initializing';
const HH_SERVER_BUSY_MESSAGE = 'hh_server is busy';

var hhPromiseQueue: ?PromiseQueue = null;
var pendingSearchPromises: Map<string, Promise> = new Map();

/**
 * Executes hh_client with proper arguments returning the result string or json object.
 */
async function _callHHClient(
  args: Array<string>,
  errorStream: boolean,
  outputJson: boolean,
  processInput: ?string,
  cwd: string): Promise<string | Object> {

  if (!hhPromiseQueue) {
    hhPromiseQueue = new PromiseQueue();
  }

  return hhPromiseQueue.submit(async (resolve, reject) => {
    // Append args on the end of our commands.
    var defaults = ['--retries', '0', '--retry-if-init', 'false', '--from', 'nuclide'];
    if (outputJson) {
      defaults.unshift('--json');
    }

    var allArgs = defaults.concat(args);
    allArgs.push(cwd);

    var execResult = null;
    try {
      execResult = await checkOutput(PATH_TO_HH_CLIENT, allArgs, {stdin: processInput});
    } catch (err) {
      reject(err);
      return;
    }
    var {stdout, stderr} = execResult;
    if (stderr.indexOf(HH_SERVER_INIT_MESSAGE) !== -1) {
      reject(new Error(`${HH_SERVER_INIT_MESSAGE}: try: \`arc build\` or try again later!`));
      return;
    } else if (stderr.startsWith(HH_SERVER_BUSY_MESSAGE)) {
      reject(Error(`${HH_SERVER_BUSY_MESSAGE}: try: \`arc build\` or try again later!`));
      return;
    }

    var output = errorStream ? stderr : stdout;
    if (!outputJson) {
      resolve(output);
      return;
    }
    try {
      resolve(JSON.parse(output));
    } catch (err) {
      var errorMessage = `hh_client error, args: [${args.join(',')}], stdout: ${stdout}, stderr: ${stderr}`;
      logger.error(errorMessage);
      reject(new Error(errorMessage));
    }
  });
}

/**
 * Gets the hh_client diagnostics for all files open
 */
function getDiagnostics(options = {}): Promise<Array<any>> {
  return _callHHClient(
    /*args*/ [],
    /*errorStream*/ true,
    /*outputJson*/ true,
    /*processInput*/ null,
    /*cwd*/ options.cwd,
  );
}

/**
 * Gets the hh_client autocompletions for the passed query string (file contents with a marker).
 */
function getCompletions(query: string, options): Promise<Array<any>> {
  return _callHHClient(
    /*args*/ ['--auto-complete'],
    /*errorStream*/ false,
    /*outputJson*/ true,
    /*processInput*/ query,
    /*cwd*/ options.cwd,
  );
}

/**
 * Gets the hh_client definition of the query with a given symbol type.
 */
async function getDefinition(query: string, symbolType: SymbolType, options = {}): Promise<Array<any>> {
  var searchTypes = symbolTypeToSearchTypes(symbolType);
  var searchResults = await getSearchResults(query, searchTypes, undefined, options);
  return searchResults.filter(result => {
    // If the request had a :: in it, it's a full name, so we should compare to
    // the name of the result in that format.
    var fullName = result.name;
    if (query.indexOf('::') !== -1 && result.scope) {
      fullName = result.scope + '::' + fullName;
    }
    return fullName === query;
  });
}

/**
 * Fetches the dependencies needed by the hack worker to cache for faster hack features response times.
 * Returnes a map of file paths to file contents.
 */
async function getDependencies(
      dependenciesInfo: Array<{name: string; type: string}>,
      options = {}
    ): Promise<any> {
  var dependencies = {};

  // hh_server currently is single threaded and processes one request at a time.
  // Hence, we fetch the dependencies one-by-one, without Promise.all for the hack search to unblock
  // user-requested hack language features and failry treat other usages of hh_client.
  for (var i = 0; i < dependenciesInfo.length; i++) {
    var {name: dependencyName, type: dependencyType} = dependenciesInfo[i];
    if (dependencyName.startsWith('\\')) {
       dependencyName = dependencyName.substring(1);
    }
    var filter;
    if (dependencyType === 'class') {
      filter = [
        SearchResultType.CLASS,
        SearchResultType.ABSTRACT_CLASS,
        SearchResultType.TRAIT,
        SearchResultType.TYPEDEF,
        SearchResultType.INTERFACE,
      ];
    } else {
      filter = [SearchResultType.FUNCTION];
    }

    var searchResults = await getSearchResults(dependencyName, filter, undefined, options);

    await Promise.all(searchResults.map(async (location) => {
      var {name, path} = location;
      if (name !== dependencyName) {
        return;
      }
      var contents = await fsPromise.readFile(path, 'utf8');
      if (!contents.startsWith('<?hh')) {
        return;
      }
      // This turns anything we're adding into decl mode, so that it uses less memory.
      // Ideally, hh_server should do this, and strip the method/function bodies.
      if (contents.startsWith(HH_NEWLINE)) {
        contents = '<?hh // decl\n' + contents.substring(HH_NEWLINE.length);
      } else if (contents.startsWith(HH_STRICT_NEWLINE)) {
        contents = '<?hh // decl\n' + contents.substring(HH_STRICT_NEWLINE.length);
      }
      dependencies[path] = contents;
    }));
  }

  return dependencies;
}

async function getSearchResults(
    search: string,
    filterTypes: ?Array<SearchResultType>,
    searchPostfix: ?string,
    options = {}
  ): Promise<Array<any>> {

  if (!search) {
    return [];
  }
  var {cwd} = options;

  // `pendingSearchPromises` is used to temporally cache search result promises.
  // So, when a matching search query is done in parallel, it will wait and resolve
  // with the original search call.
  var searchPromise = pendingSearchPromises.get(search);
  if (!searchPromise) {
    searchPromise = _callHHClient(
        /*args*/ ['--search' + (searchPostfix || ''), search],
        /*errorStream*/ false,
        /*outputJson*/ true,
        /*processInput*/ null,
        /*cwd*/ cwd,
    );
    pendingSearchPromises.set(search, searchPromise);
  }

  var response = null;
  try {
    response = await searchPromise;
  } finally {
    pendingSearchPromises.delete(search);
  }
  var results = response.map(result => {
    var filePath = result.filename;
    if (!filePath.startsWith(cwd)) {
      return null;
    }
    return {
      line: result.line - 1,
      column: result.char_start - 1,
      name: result.name,
      path: filePath,
      length: result.char_end - result.char_start + 1,
      scope: result.scope,
      additionalInfo: result.desc,
      action: 'OPEN_PATH',
    };
  });
  // Filter out files out of repo results, e.g. hh internal files.
  results = results.filter(result => !!result);
  if (filterTypes) {
    results = filterSearchResults(results, filterTypes);
  }
  return results;
}

// Eventually this will happen on the hack side, but for now, this will do.
function filterSearchResults(
  results: Array<any>,
  filter: Array<SearchResultType>)
  : Array<any> {

  return results.filter((result) => {
    var info = result.additionalInfo;
    var searchType = getSearchType(info);
    return filter.indexOf(searchType) !== -1;
  });
}

function getSearchType(info: string): SearchResultType {
  switch (info) {
    case 'typedef':
      return SearchResultType.TYPEDEF;
    case 'function':
      return SearchResultType.FUNCTION;
    case 'constant':
      return SearchResultType.CONSTANT;
    case 'trait':
      return SearchResultType.TRAIT;
    case 'interface':
      return SearchResultType.INTERFACE;
    case 'abstract class':
      return SearchResultType.ABSTRACT_CLASS;
    default: {
      if (info.startsWith('method') || info.startsWith('static method')) {
        return SearchResultType.METHOD;
      }
      if (info.startsWith('class var') || info.startsWith('static class var')) {
        return SearchResultType.CLASS_VAR;
      }
      return SearchResultType.CLASS;
    }
  }
}

function symbolTypeToSearchTypes(symbolType: SymbolType): ?Array<SearchResultType> {
  switch (symbolType) {
    case SymbolType.CLASS:
      return [
        SearchResultType.CLASS,
        SearchResultType.ABSTRACT_CLASS,
        SearchResultType.TRAIT,
        SearchResultType.TYPEDEF,
        SearchResultType.INTERFACE,
      ];
     case SymbolType.METHOD:
       return [ SearchResultType.METHOD ];
     case SymbolType.FUNCTION:
       return [ SearchResultType.FUNCTION ];
     default:
       return null;
  }
}

async function getReferences(
  symbolName: string,
  options: Object = {}
): Promise<Array<HackReference>> {
  return await _callHHClient(
    /*args*/ ['--find-refs', symbolName],
    /*errorStream*/ false,
    /*outputJson*/ true,
    /*processInput*/ null,
    /*cwd*/ options.cwd,
  );
}

async function isClientAvailable(): Promise<boolean> {
  var {stdout} = await checkOutput('which', [PATH_TO_HH_CLIENT]);
  // The `stdout` would be empty if there is no such command.
  return stdout.trim().length > 0;
}

module.exports = {
  services: {
    '/hack/getDiagnostics': {handler: getDiagnostics, method: 'post'},
    '/hack/getCompletions': {handler: getCompletions, method: 'post'},
    '/hack/getDefinition': {handler: getDefinition, method: 'post'},
    '/hack/getDependencies': {handler: getDependencies, method: 'post'},
    '/hack/getSearchResults': {handler: getSearchResults, method: 'post'},
    '/hack/getReferences': {handler: getReferences, method: 'post'},
    '/hack/isClientAvailable': {handler: isClientAvailable, method: 'post'},
  }
};
