'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  HackDiagnosticsResult,
  HackDiagnostic,
  HackCompletionsResult,
  HackCompletion,
  HackDefinitionResult,
  HackSearchResult,
  HackReference,
  HackReferencesResult,
} from './types';
import type {SymbolTypeValue} from 'nuclide-hack-common/lib/constants';
import type {NuclideUri} from 'nuclide-remote-uri';

import {fsPromise} from 'nuclide-commons';
import invariant from 'assert';
import {SearchResultType} from 'nuclide-hack-common/lib/constants';
import {
  callHHClient,
  symbolTypeToSearchTypes,
  getSearchResults,
} from './HackHelpers';

const HH_NEWLINE = '<?hh\n';
const HH_STRICT_NEWLINE = '<?hh // strict\n';

export async function getDiagnostics(
  file: NuclideUri,
  currentContents?: string
): Promise<?HackDiagnosticsResult> {
  const hhResult = await callHHClient(
    /*args*/ [],
    /*errorStream*/ true,
    /*outputJson*/ true,
    /*processInput*/ null,
    /*file*/ file,
  );
  if (!hhResult) {
    return null;
  }
  const {hackRoot, result} = hhResult;
  const messages = (
    (result: any): {errors: Array<{message: HackDiagnostic}>}
  ).errors;
  return {
    hackRoot,
    messages,
  };
}

export async function getCompletions(
  file: NuclideUri,
  markedContents: string
): Promise<?HackCompletionsResult> {
  var hhResult = await callHHClient(
    /*args*/ ['--auto-complete'],
    /*errorStream*/ false,
    /*outputJson*/ true,
    /*processInput*/ markedContents,
    /*file*/ file,
  );
  if (!hhResult) {
    return null;
  }
  var {hackRoot, result} = hhResult;
  var completions = ((result : any): Array<HackCompletion>);
  return {
    hackRoot,
    completions,
  };
}

/**
 * Gets the hh_client definition of the query with a given symbol type.
 */
export async function getDefinition(
  file: NuclideUri,
  query: string,
  symbolType: SymbolTypeValue,
): Promise<?HackDefinitionResult> {
  const searchTypes = symbolTypeToSearchTypes(symbolType);
  const searchResponse = await getSearchResults(file, query, searchTypes);
  return selectDefinitionSearchResult(searchResponse, query);
}

export async function getIdentifierDefinition(
  file: NuclideUri,
  contents: string,
  line: number,
  column: number,
): Promise<?HackDefinitionResult> {
  const hhResult = await callHHClient(
    // The `indetify-function` result is text, but passing --json option
    // will eliminate any hh status messages that's irrelevant.
    /*args*/ ['--json', '--identify-function', `${line}:${column}`],
    /*errorStream*/ false,
    /*outputJson*/ false,
    /*processInput*/ contents,
    /*cwd*/ file,
  );
  if (!hhResult) {
    return null;
  }
  const identifier = (hhResult.result || '').trim();
  if (!identifier) {
    return null;
  }
  const searchResponse = await getSearchResults(file, identifier);
  return selectDefinitionSearchResult(searchResponse, identifier);
}

/**
 * Fetches the dependencies needed by the hack worker to cache
 * for faster hack features response times.
 * Returns a map of file paths to file contents.
 */
export async function getDependencies(
  filePath: NuclideUri,
  dependenciesInfo: Array<{name: string; type: string}>,
): Promise<?{
  hackRoot: NuclideUri;
  dependencies: Map<string, string>;
}> {
  const dependencies = new Map();
  const dependencyPaths = new Set();
  let hackRoot = '';
  // hh_server currently is single threaded and processes one request at a time.
  // Hence, we fetch the dependencies one-by-one, without Promise.all for the hack search
  // to unblock user-requested hack language features and failry treat other usages of hh_client.
  /* eslint-disable no-await-in-loop */
  for (const dependency of dependenciesInfo) {
    let {name: dependencyName, type: dependencyType} = dependency;
    if (dependencyName.startsWith('\\')) {
      dependencyName = dependencyName.substring(1);
    }
    let filter;
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

    const searchResponse = await getSearchResults(filePath, dependencyName, filter);
    if (searchResponse == null) {
      continue;
    }
    invariant(searchResponse);
    const {result: searchResults} = searchResponse;
    hackRoot = searchResponse.hackRoot;
    await Promise.all(searchResults.map(async (location) => {
      const {name, path} = location;
      if (name !== dependencyName || dependencyPaths.has(path)) {
        return;
      }
      dependencyPaths.add(path);
      let contents = await fsPromise.readFile(path, 'utf8');
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
      dependencies.set(path, contents);
    }));
  }
  /* eslint-enable no-await-in-loop */
  return {
    hackRoot,
    dependencies,
  };
}

export async function getReferences(
  filePath: NuclideUri,
  symbolName: string,
): Promise<?HackReferencesResult> {
  var hhResult = await callHHClient(
    /*args*/ ['--find-refs', symbolName],
    /*errorStream*/ false,
    /*outputJson*/ true,
    /*processInput*/ null,
    /*file*/ filePath,
  );
  if (!hhResult) {
    return null;
  }
  var {hackRoot, result} = hhResult;
  var references = ((result: any): Array<HackReference>);
  return {
    hackRoot,
    references,
  };
}

function selectDefinitionSearchResult(
  searchReposnse: ?HackSearchResult,
  query: string,
): ?HackDefinitionResult {
  if (!searchReposnse) {
    return null;
  }
  var {result: searchResults, hackRoot} = searchReposnse;
  const matchingResults = searchResults.filter(result => {
    // If the request had a :: in it, it's a full name, so we should compare to
    // the name of the result in that format.
    let fullName = result.name;
    if (query.indexOf('::') !== -1 && result.scope) {
      fullName = result.scope + '::' + fullName;
    }
    return fullName === query;
  });
  if (matchingResults.length === 1) {
    return {
      hackRoot,
      definition: matchingResults[0],
    };
  } else {
    return null;
  }
}
