Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.default = search;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _split2;

function _split() {
  return _split2 = _interopRequireDefault(require('split'));
}

// This pattern is used for parsing the output of grep.
var GREP_PARSE_PATTERN = /(.*?):(\d*):(.*)/;

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
  var matchesByFile = new Map();

  if (!subdirs || subdirs.length === 0) {
    // Since no subdirs were specified, run search on the root directory.
    return searchInSubdir(matchesByFile, directory, '.', regex);
  } else if (subdirs.length === 1 && subdirs[0].includes('*')) {
    // Filters results by glob specified in subdirs[0]
    var unfilteredResults = searchInSubdir(matchesByFile, directory, '.', regex);

    return unfilteredResults.filter(function (result) {
      var glob = subdirs[0];
      var matches = result.filePath.match(globToRegex(glob));
      return matches != null && matches.length > 0;
    });
  } else {
    // Run the search on each subdirectory that exists.
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.from(subdirs).concatMap(_asyncToGenerator(function* (subdir) {
      try {
        var stat = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.lstat((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(directory, subdir));
        if (stat.isDirectory()) {
          return searchInSubdir(matchesByFile, directory, subdir, regex);
        } else {
          return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
        }
      } catch (e) {
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
      }
    })).mergeAll();
  }
}

// Helper function that runs the search command on the given directory
// `subdir`, relative to `directory`. The function returns an Observable that emits
// search$FileResult objects.
function searchInSubdir(matchesByFile, directory, subdir, regex) {
  // Try running search commands, falling through to the next if there is an error.
  var vcsargs = (regex.ignoreCase ? ['-i'] : []).concat(['-n', regex.source]);
  var grepargs = (regex.ignoreCase ? ['-i'] : []).concat(['-rHn', '-e', regex.source, '.']);
  var cmdDir = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(directory, subdir);
  var linesSource = getLinesFromCommand('hg', ['wgrep'].concat(vcsargs), cmdDir).catch(function () {
    return getLinesFromCommand('git', ['grep'].concat(vcsargs), cmdDir);
  }).catch(function () {
    return getLinesFromCommand('grep', grepargs, cmdDir);
  }).catch(function () {
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.throw(new Error('Failed to execute a grep search.'));
  });

  // Transform lines into file matches.
  return linesSource.flatMap(function (line) {
    // Try to parse the output of grep.
    var grepMatchResult = line.match(GREP_PARSE_PATTERN);
    if (!grepMatchResult) {
      return [];
    }

    // Extract the filename, line number, and line text from grep output.
    var lineText = grepMatchResult[3];
    var lineNo = parseInt(grepMatchResult[2], 10) - 1;
    var filePath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(subdir, grepMatchResult[1]);

    // Try to extract the actual "matched" text.
    var matchTextResult = regex.exec(lineText);
    if (!matchTextResult) {
      return [];
    }

    // IMPORTANT: reset the regex for the next search
    regex.lastIndex = 0;

    var matchText = matchTextResult[0];
    var matchIndex = matchTextResult.index;

    // Put this match into lists grouped by files.
    var matches = matchesByFile.get(filePath);
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
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.create(function (observer) {
    var proc = null;
    var exited = false;

    // Spawn the search command in the given directory.
    (0, (_commonsNodeProcess2 || _commonsNodeProcess()).safeSpawn)(command, args, { cwd: localDirectoryPath }).then(function (child) {
      proc = child;

      // Reject on error.
      proc.on('error', observer.error.bind(observer));

      // Call the callback on each line.
      proc.stdout.pipe((0, (_split2 || _split()).default)()).on('data', observer.next.bind(observer));

      // Keep a running string of stderr, in case we need to throw an error.
      var stderr = '';
      proc.stderr.on('data', function (data) {
        stderr += data;
      });

      // Resolve promise if error code is 0 (found matches) or 1 (found no matches). Otherwise
      // reject. However, if a process was killed with a signal, don't reject, since this was likely
      // to cancel the search.
      proc.on('close', function (code, signal) {
        exited = true;
        if (signal || code <= 1) {
          observer.complete();
        } else {
          observer.error(new Error(stderr));
        }
      });
    }).catch(function (error) {
      observer.error(error);
    });

    // Kill the search process on dispose.
    return function () {
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
module.exports = exports.default;