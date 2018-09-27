"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isEligibleForDirectory = isEligibleForDirectory;
exports.codeSearch = codeSearch;
exports.searchFiles = searchFiles;
exports.remoteAtomSearch = remoteAtomSearch;

function _searchTools() {
  const data = require("./searchTools");

  _searchTools = function () {
    return data;
  };

  return data;
}

function _searchInDirectory() {
  const data = require("./searchInDirectory");

  _searchInDirectory = function () {
    return data;
  };

  return data;
}

function _FileSystemService() {
  const data = require("../../nuclide-server/lib/services/FileSystemService");

  _FileSystemService = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
// Limit the total result size to avoid overloading the Nuclide server + Atom.
const MATCH_BYTE_LIMIT = 2 * 1024 * 1024;

async function isEligibleForDirectory(rootDirectory) {
  const checks = await Promise.all([(0, _searchTools().resolveTool)(null).then(tool => tool == null), (0, _FileSystemService().isNfs)(rootDirectory), (0, _FileSystemService().isFuse)(rootDirectory)]);
  return !checks.some(x => x);
}
/**
 * @param directory - The directory in which to perform a search.
 * @param regex - The pattern to match.
 * @param useVcsSearch - Whether to try to use hg/git grep to find the pattern.
 * @param tool - Which tool to use from POSIX_TOOLS or WINDOWS_TOOLS,
 *   default to first one available.
 * @param maxResults - Maximum number of results to emit.
 * @returns An observable that emits results.
 */


function codeSearch(directory, regex, useVcsSearch, tool, maxResults) {
  return (0, _searchInDirectory().searchInDirectory)(tool, useVcsSearch, {
    regex,
    directory,
    recursive: true
  }).take(maxResults).publish();
}
/**
 * @param files - The files in which to perform a search.
 * @param regex - The pattern to match.
 * @param tool - Which tool to use from POSIX_TOOLS or WINDOWS_TOOLS,
 *   default to first one available.
 * @param maxResults - Maximum number of results to emit.
 * @returns An observable that emits results.
 */


function searchFiles(files, regex, tool, leadingLines, trailingLines, maxResults) {
  return (0, _searchTools().searchWithTool)(tool, {
    recursive: false,
    files,
    regex,
    leadingLines,
    trailingLines,
    limit: maxResults
  }).publish();
}
/**
 * Searches for all instances of a pattern in subdirectories.
 * @returns An observable that emits match events.
 */


function remoteAtomSearch( // The directory in which to perform a search.
directory, // The pattern to match.
regex, // An array of subdirectories to search within `directory`. If subdirs is an
subdirs, // Whether to try to use hg/git grep to find the pattern.
useVcsSearch, // Which tool to use from POSIX_TOOLS or WINDOWS_TOOLS,
tool, // Number of leading context lines to include.
leadingLines, // Number of trailing context lines to include.
trailingLines) {
  return mergeSearchResults((0, _searchInDirectory().searchInDirectories)(subdirs, tool, useVcsSearch, {
    regex,
    leadingLines,
    trailingLines,
    recursive: true,
    directory
  })).publish();
} // Convert CodeSearchResults into search$FileResult.


function mergeSearchResults(codeSearchResults) {
  const results = codeSearchResults.map(({
    file,
    row,
    line,
    column,
    matchLength,
    leadingContext,
    trailingContext
  }) => ({
    filePath: file,
    match: {
      lineText: line,
      lineTextOffset: 0,
      matchText: line.slice(column, column + matchLength),
      range: [[row, column], [row, column + matchLength]],
      leadingContextLines: leadingContext,
      trailingContextLines: trailingContext
    }
  })).share();
  return results // Limit the total result size.
  .merge(results.scan((size, {
    match
  }) => size + match.lineText.length + match.matchText.length, 0).filter(size => size > MATCH_BYTE_LIMIT).switchMapTo(_RxMin.Observable.throw(Error(`Too many results, truncating to ${MATCH_BYTE_LIMIT} bytes`))).ignoreElements()) // Buffer results by file. Flush when the file changes, or on completion.
  .buffer(_RxMin.Observable.concat(results.distinct(result => result.filePath), _RxMin.Observable.of(null))).filter(buffer => buffer.length > 0).map(buffer => ({
    filePath: buffer[0].filePath,
    matches: buffer.map(x => x.match)
  }));
}