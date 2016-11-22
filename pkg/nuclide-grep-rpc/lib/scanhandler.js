'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.default = search;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _split;

function _load_split() {
  return _split = _interopRequireDefault(require('split'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This pattern is used for parsing the output of grep.
const GREP_PARSE_PATTERN = /(.*?):(\d*):(.*)/;

/**
 * Searches for all instances of a pattern in a directory.
 * @param directory - The directory in which to perform a search.
 * @param regex - The pattern to match.
 * @param subdirs - An array of subdirectories to search within `directory`. If subdirs is an
 *   empty array, then simply search in directory.
 * @returns An observable that emits match events.
 */
function search(directory, regex, subdirs) {
  // Matches are stored in a Map of filename => Array<Match>.
  const matchesByFile = new Map();

  if (!subdirs || subdirs.length === 0) {
    // Since no subdirs were specified, run search on the root directory.
    return searchInSubdir(matchesByFile, directory, '.', regex);
  } else if (subdirs.length === 1 && subdirs[0].includes('*')) {
    // Filters results by glob specified in subdirs[0]
    const unfilteredResults = searchInSubdir(matchesByFile, directory, '.', regex);

    return unfilteredResults.filter(result => {
      const glob = subdirs[0];
      const matches = result.filePath.match(globToRegex(glob));
      return matches != null && matches.length > 0;
    });
  } else {
    // Run the search on each subdirectory that exists.
    return _rxjsBundlesRxMinJs.Observable.from(subdirs).concatMap((() => {
      var _ref = (0, _asyncToGenerator.default)(function* (subdir) {
        try {
          const stat = yield (_fsPromise || _load_fsPromise()).default.lstat((_nuclideUri || _load_nuclideUri()).default.join(directory, subdir));
          if (stat.isDirectory()) {
            return searchInSubdir(matchesByFile, directory, subdir, regex);
          } else {
            return _rxjsBundlesRxMinJs.Observable.empty();
          }
        } catch (e) {
          return _rxjsBundlesRxMinJs.Observable.empty();
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })()).mergeAll();
  }
}

// Helper function that runs the search command on the given directory
// `subdir`, relative to `directory`. The function returns an Observable that emits
// search$FileResult objects.
function searchInSubdir(matchesByFile, directory, subdir, regex) {
  // Try running search commands, falling through to the next if there is an error.
  const vcsargs = (regex.ignoreCase ? ['-i'] : []).concat(['-n', '-E', regex.source]);
  const grepargs = (regex.ignoreCase ? ['-i'] : []).concat(['-rHn', '-E', '-e', regex.source, '.']);
  const cmdDir = (_nuclideUri || _load_nuclideUri()).default.join(directory, subdir);
  const linesSource = getLinesFromCommand('hg', ['wgrep'].concat(vcsargs), cmdDir).catch(() => getLinesFromCommand('git', ['grep'].concat(vcsargs), cmdDir)).catch(() => getLinesFromCommand('grep', grepargs, cmdDir)).catch(() => _rxjsBundlesRxMinJs.Observable.throw(new Error('Failed to execute a grep search.')));

  // Transform lines into file matches.
  return linesSource.flatMap(line => {
    // Try to parse the output of grep.
    const grepMatchResult = line.match(GREP_PARSE_PATTERN);
    if (!grepMatchResult) {
      return [];
    }

    // Extract the filename, line number, and line text from grep output.
    const lineText = grepMatchResult[3];
    const lineNo = parseInt(grepMatchResult[2], 10) - 1;
    const filePath = (_nuclideUri || _load_nuclideUri()).default.join(subdir, grepMatchResult[1]);

    // Try to extract the actual "matched" text.
    const matchTextResult = regex.exec(lineText);
    if (!matchTextResult) {
      return [];
    }

    // IMPORTANT: reset the regex for the next search
    regex.lastIndex = 0;

    const matchText = matchTextResult[0];
    const matchIndex = matchTextResult.index;

    // Put this match into lists grouped by files.
    let matches = matchesByFile.get(filePath);
    if (matches == null) {
      matches = [];
      matchesByFile.set(filePath, matches);
    }
    matches.push({
      lineText: lineText,
      lineTextOffset: 0,
      matchText: matchText,
      range: [[lineNo, matchIndex], [lineNo, matchIndex + matchText.length]]
    });

    // If a callback was provided, invoke it with the newest update.
    return [{ matches: matches, filePath: filePath }];
  });
}

// Helper function that runs a command in a given directory, invoking a callback
// as each line is written to stdout.
function getLinesFromCommand(command, args, localDirectoryPath) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    let exited = false;

    // Spawn the search command in the given directory.
    const proc = (0, (_process || _load_process()).safeSpawn)(command, args, { cwd: localDirectoryPath });

    // Reject on error.
    proc.on('error', observer.error.bind(observer));

    // Call the callback on each line.
    proc.stdout.pipe((0, (_split || _load_split()).default)()).on('data', observer.next.bind(observer));

    // Keep a running string of stderr, in case we need to throw an error.
    let stderr = '';
    proc.stderr.on('data', data => {
      stderr += data;
    });

    // Resolve promise if error code is 0 (found matches) or 1 (found no matches). Otherwise
    // reject. However, if a process was killed with a signal, don't reject, since this was likely
    // to cancel the search.
    proc.on('close', (code, signal) => {
      exited = true;
      if (signal || code <= 1) {
        observer.complete();
      } else {
        observer.error(new Error(stderr));
      }
    });

    // Kill the search process on dispose.
    return () => {
      if (!exited) {
        proc && proc.kill();
      }
    };
  });
}

// Converts a wildcard string to JS RegExp.
function globToRegex(str) {
  return new RegExp(preg_quote(str).replace(/\\\*/g, '.*').replace(/\\\?/g, '.'), 'g');
}

function preg_quote(str, delimiter) {
  return String(str).replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}
module.exports = exports['default'];