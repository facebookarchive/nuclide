'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isEligibleForDirectory = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let isEligibleForDirectory = exports.isEligibleForDirectory = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (rootDirectory) {
    const checks = yield Promise.all([(0, (_searchInDirectory || _load_searchInDirectory()).resolveTool)(null).then(function (tool) {
      return tool == null;
    }), (0, (_FileSystemService || _load_FileSystemService()).isNfs)(rootDirectory), (0, (_FileSystemService || _load_FileSystemService()).isFuse)(rootDirectory)]);
    if (checks.some(function (x) {
      return x;
    })) {
      return false;
    }

    return true;
  });

  return function isEligibleForDirectory(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @param directory - The directory in which to perform a search.
 * @param regex - The pattern to match.
 * @param useVcsSearch - Whether to try to use hg/git grep to find the pattern.
 * @param tool - Which tool to use from POSIX_TOOLS or WINDOWS_TOOLS,
 *   default to first one available.
 * @param maxResults - Maximum number of results to emit.
 * @returns An observable that emits results.
 */


exports.codeSearch = codeSearch;
exports.remoteAtomSearch = remoteAtomSearch;

var _searchInDirectory;

function _load_searchInDirectory() {
  return _searchInDirectory = require('./searchInDirectory');
}

var _FileSystemService;

function _load_FileSystemService() {
  return _FileSystemService = require('../../nuclide-server/lib/services/FileSystemService');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Limit the total result size to avoid overloading the Nuclide server + Atom.
const MATCH_BYTE_LIMIT = 2 * 1024 * 1024; /**
                                           * Copyright (c) 2015-present, Facebook, Inc.
                                           * All rights reserved.
                                           *
                                           * This source code is licensed under the license found in the LICENSE file in
                                           * the root directory of this source tree.
                                           *
                                           * 
                                           * @format
                                           */

function codeSearch(directory, regex, useVcsSearch, tool, maxResults) {
  return (0, (_searchInDirectory || _load_searchInDirectory()).searchInDirectory)(directory, regex, tool, useVcsSearch).take(maxResults).publish();
}

/**
 * Searches for all instances of a pattern in subdirectories.
 * @param directory - The directory in which to perform a search.
 * @param regex - The pattern to match.
 * @param subdirs - An array of subdirectories to search within `directory`. If subdirs is an
 *   empty array, then simply search in directory.
 * @param useVcsSearch - Whether to try to use hg/git grep to find the pattern.
 * @param tool - Which tool to use from POSIX_TOOLS or WINDOWS_TOOLS,
 *   default to first one available.
 * @returns An observable that emits match events.
 */
function remoteAtomSearch(directory, regex, subdirs, useVcsSearch, tool) {
  return mergeSearchResults((0, (_searchInDirectory || _load_searchInDirectory()).searchInDirectories)(directory, regex, subdirs, useVcsSearch, tool), regex).publish();
}

// Convert CodeSearchResults into search$FileResult.
function mergeSearchResults(codeSearchResults, regex) {
  const results = codeSearchResults.flatMap(searchResult => {
    const { file, row, line } = searchResult;

    // Try to extract all actual "matched" texts on the same line.
    const result = [];
    // Loop through each matched text on a line
    let matchTextResult;
    // Note: Atom will auto-insert 'g' flag, so, we can loop through all matches.
    while ((matchTextResult = regex.exec(line)) != null) {
      const matchText = matchTextResult[0];
      const matchIndex = matchTextResult.index;
      // Some invalid regex (e.g. /||/g) will always match,
      // but with an empty match string, so the exec loop becomes infinite.
      // Check for this case and abort early.
      if (matchText.length === 0) {
        break;
      }
      result.push({
        filePath: file,
        match: {
          lineText: line,
          lineTextOffset: 0,
          matchText,
          range: [[row, matchIndex], [row, matchIndex + matchText.length]]
        }
      });

      // Handle corner case if 'g' flag is not provided
      if (!regex.global) {
        break;
      }
    }

    // IMPORTANT: reset the regex for the next search
    regex.lastIndex = 0;

    return result;
  }).share();

  return results
  // Limit the total result size.
  .merge(results.scan((size, { match }) => size + match.lineText.length + match.matchText.length, 0).filter(size => size > MATCH_BYTE_LIMIT).switchMapTo(_rxjsBundlesRxMinJs.Observable.throw(Error(`Too many results, truncating to ${MATCH_BYTE_LIMIT} bytes`))).ignoreElements())
  // Buffer results by file. Flush when the file changes, or on completion.
  .buffer(_rxjsBundlesRxMinJs.Observable.concat(results.distinct(result => result.filePath), _rxjsBundlesRxMinJs.Observable.of(null))).filter(buffer => buffer.length > 0).map(buffer => ({
    filePath: buffer[0].filePath,
    matches: buffer.map(x => x.match)
  }));
}