'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HackSearchResult, HackSearchPosition, HHSearchPosition} from './types';
import type {SearchResultTypeValue, SymbolTypeValue} from 'nuclide-hack-common/lib/constants';

import path from 'path';
import invariant from 'assert';
import {findNearestFile, checkOutput, PromiseQueue} from 'nuclide-commons';
import {SearchResultType, SymbolType} from 'nuclide-hack-common/lib/constants';

const PATH_TO_HH_CLIENT = 'hh_client';
const HH_SERVER_INIT_MESSAGE = 'hh_server still initializing';
const HH_SERVER_BUSY_MESSAGE = 'hh_server is busy';
const logger = require('nuclide-logging').getLogger();

var hhPromiseQueue: ?PromiseQueue = null;
var pendingSearchPromises: Map<string, Promise> = new Map();

const SYMBOL_CLASS_SEARCH_TYPES = Object.freeze([
  SearchResultType.CLASS,
  SearchResultType.ABSTRACT_CLASS,
  SearchResultType.TRAIT,
  SearchResultType.TYPEDEF,
  SearchResultType.INTERFACE,
]);
const SYMBOL_METHOD_SEARCH_TYPES = Object.freeze([SearchResultType.METHOD]);
const SYMBOL_FUNCTION_SEARCH_TYPES = Object.freeze([SearchResultType.FUNCTION]);

/**
* If this returns null, then it is not safe to run hack.
*/
function findHackConfigDir(localFile: string): Promise<?string> {
  return findNearestFile('.hhconfig', localFile);
}

export async function getHackExecOptions(
  localFile: string
): Promise<?{hackRoot: string, hackCommand: string}> {
  // $FlowFixMe incompatible type.
  var [hhResult, hackRoot] = await Promise.all([
    // `stdout` would be empty if there is no such command.
    checkOutput('which', [PATH_TO_HH_CLIENT]),
    findHackConfigDir(localFile),
  ]);
  var hackCommand = hhResult.stdout.trim();
  if (hackRoot && hackCommand) {
    return {hackRoot, hackCommand};
  } else {
    return null;
  }
}

 /**
  * Executes hh_client with proper arguments returning the result string or json object.
  */
export async function callHHClient(
  args: Array<string>,
  errorStream: boolean,
  outputJson: boolean,
  processInput: ?string,
  filePath: string): Promise<?{hackRoot: string, result: string | Object}> {

  if (!hhPromiseQueue) {
    hhPromiseQueue = new PromiseQueue();
  }

  var hackExecOptions = await getHackExecOptions(filePath);
  if (!hackExecOptions) {
    return null;
  }
  var {hackRoot} = hackExecOptions;

  invariant(hhPromiseQueue);
  return hhPromiseQueue.submit(async (resolve, reject) => {
    // Append args on the end of our commands.
    var defaults = ['--retries', '0', '--retry-if-init', 'false', '--from', 'nuclide'];
    if (outputJson) {
      defaults.unshift('--json');
    }

    var allArgs = defaults.concat(args);
    allArgs.push(hackRoot);

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
      reject(new Error(`${HH_SERVER_BUSY_MESSAGE}: try: \`arc build\` or try again later!`));
      return;
    }

    var output = errorStream ? stderr : stdout;
    if (!outputJson) {
      resolve({result: output, hackRoot});
      return;
    }
    try {
      resolve({result: JSON.parse(output), hackRoot});
    } catch (err) {
      var errorMessage = `hh_client error, args: [${args.join(',')}]
stdout: ${stdout}, stderr: ${stderr}`;
      logger.error(errorMessage);
      reject(new Error(errorMessage));
    }
  });
}

export async function getSearchResults(
    filePath: string,
    search: string,
    filterTypes?: ?Array<SearchResultTypeValue>,
    searchPostfix?: string,
  ): Promise<?HackSearchResult> {
  if (!search) {
    return null;
  }

  // `pendingSearchPromises` is used to temporally cache search result promises.
  // So, when a matching search query is done in parallel, it will wait and resolve
  // with the original search call.
  let searchPromise = pendingSearchPromises.get(search);
  if (!searchPromise) {
    searchPromise = callHHClient(
        /*args*/ ['--search' + (searchPostfix || ''), search],
        /*errorStream*/ false,
        /*outputJson*/ true,
        /*processInput*/ null,
        /*file*/ filePath,
    );
    pendingSearchPromises.set(search, searchPromise);
  }

  let searchResponse: ?{hackRoot: string; result: Array<HHSearchPosition>} = null;
  try {
    searchResponse = (
      ((await searchPromise): any): {hackRoot: string; result: Array<HHSearchPosition>}
    );
  } catch (error) {
    throw error;
  } finally {
    pendingSearchPromises.delete(search);
  }

  if (!searchResponse) {
    return null;
  }

  const {result: searchResult, hackRoot} = searchResponse;
  let result: Array<HackSearchPosition> = [];
  for (let entry of searchResult) {
    const resultFile = entry.filename;
    if (!resultFile.startsWith(hackRoot)) {
      // Filter out files out of repo results, e.g. hh internal files.
      continue;
    }
    result.push({
      line: entry.line - 1,
      column: entry.char_start - 1,
      name: entry.name,
      path: resultFile,
      length: entry.char_end - entry.char_start + 1,
      scope: entry.scope,
      additionalInfo: entry.desc,
    });
  }

  if (filterTypes) {
    result = filterSearchResults(result, filterTypes);
  }
  return {hackRoot, result};
}

// Eventually this will happen on the hack side, but for now, this will do.
function filterSearchResults(
  results: Array<HackSearchPosition>,
  filter: Array<SearchResultTypeValue>,
): Array<HackSearchPosition> {
  return results.filter((result) => {
    var info = result.additionalInfo;
    var searchType = getSearchType(info);
    return filter.indexOf(searchType) !== -1;
  });
}

function getSearchType(info: string): SearchResultTypeValue {
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

export function symbolTypeToSearchTypes(
  symbolType: SymbolTypeValue,
): ?Array<SearchResultTypeValue> {
  switch (symbolType) {
    case SymbolType.CLASS:
      return SYMBOL_CLASS_SEARCH_TYPES;
    case SymbolType.METHOD:
      return SYMBOL_METHOD_SEARCH_TYPES;
    case SymbolType.FUNCTION:
      return SYMBOL_FUNCTION_SEARCH_TYPES;
    default:
      return null;
  }
}
