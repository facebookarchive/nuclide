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

exports['default'] = search;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _rx = require('rx');

var _nuclideCommons = require('../../nuclide-commons');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _split = require('split');

var _split2 = _interopRequireDefault(_split);

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
  } else {
    // Run the search on each subdirectory that exists.
    return _rx.Observable.from(subdirs).concatMap(_asyncToGenerator(function* (subdir) {
      try {
        var stat = yield _nuclideCommons.fsPromise.lstat(_path2['default'].join(directory, subdir));
        if (stat.isDirectory()) {
          return searchInSubdir(matchesByFile, directory, subdir, regex);
        } else {
          return _rx.Observable.empty();
        }
      } catch (e) {
        return _rx.Observable.empty();
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
  var cmdDir = _path2['default'].join(directory, subdir);
  var linesSource = _rx.Observable['catch'](getLinesFromCommand('hg', ['wgrep'].concat(vcsargs), cmdDir), getLinesFromCommand('git', ['grep'].concat(vcsargs), cmdDir), getLinesFromCommand('grep', grepargs, cmdDir), _rx.Observable['throw'](new Error('Failed to execute a grep search.')));

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
    var filePath = _path2['default'].join(subdir, grepMatchResult[1]);

    // Try to extract the actual "matched" text.
    var matchTextResult = regex.exec(lineText);
    if (!matchTextResult) {
      return [];
    }
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
  return _rx.Observable.create(function (observer) {
    var proc = null;
    var exited = false;

    // Spawn the search command in the given directory.
    (0, _nuclideCommons.safeSpawn)(command, args, { cwd: localDirectoryPath }).then(function (child) {
      proc = child;

      // Reject on error.
      proc.on('error', observer.onError.bind(observer));

      // Call the callback on each line.
      proc.stdout.pipe((0, _split2['default'])()).on('data', observer.onNext.bind(observer));

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
          observer.onCompleted();
        } else {
          observer.onError(new Error(stderr));
        }
      });
    })['catch'](function (error) {
      observer.onError(error);
    });

    // Kill the search process on dispose.
    return function () {
      if (!exited) {
        proc && proc.kill();
      }
    };
  });
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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WCxVQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsWUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNyQjtLQUNGLENBQUM7R0FDSCxDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJzY2FuaGFuZGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgc2VhcmNoJEZpbGVSZXN1bHQsXG4gIHNlYXJjaCRNYXRjaCxcbn0gZnJvbSAnLi4nO1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxuaW1wb3J0IHtcbiAgZnNQcm9taXNlLFxuICBzYWZlU3Bhd24sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBzcGxpdCBmcm9tICdzcGxpdCc7XG5cbi8vIFRoaXMgcGF0dGVybiBpcyB1c2VkIGZvciBwYXJzaW5nIHRoZSBvdXRwdXQgb2YgZ3JlcC5cbmNvbnN0IEdSRVBfUEFSU0VfUEFUVEVSTiA9IC8oLio/KTooXFxkKik6KC4qKS87XG5cbi8qKlxuICogU2VhcmNoZXMgZm9yIGFsbCBpbnN0YW5jZXMgb2YgYSBwYXR0ZXJuIGluIGEgZGlyZWN0b3J5LlxuICogQHBhcmFtIGRpcmVjdG9yeSAtIFRoZSBkaXJlY3RvcnkgaW4gd2hpY2ggdG8gcGVyZm9ybSBhIHNlYXJjaC5cbiAqIEBwYXJhbSByZWdleCAtIFRoZSBwYXR0ZXJuIHRvIG1hdGNoLlxuICogQHBhcmFtIHN1YmRpcnMgLSBBbiBhcnJheSBvZiBzdWJkaXJlY3RvcmllcyB0byBzZWFyY2ggd2l0aGluIGBkaXJlY3RvcnlgLiBJZiBzdWJkaXJzIGlzIGFuXG4gKiAgIGVtcHR5IGFycmF5LCB0aGVuIHNpbXBseSBzZWFyY2ggaW4gZGlyZWN0b3J5LlxuICogQHJldHVybnMgQW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIG1hdGNoIGV2ZW50cy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2VhcmNoKGRpcmVjdG9yeTogc3RyaW5nLCByZWdleDogUmVnRXhwLCBzdWJkaXJzOiBBcnJheTxzdHJpbmc+KTpcbiAgICBPYnNlcnZhYmxlPHNlYXJjaCRGaWxlUmVzdWx0PiB7XG4gIC8vIE1hdGNoZXMgYXJlIHN0b3JlZCBpbiBhIE1hcCBvZiBmaWxlbmFtZSA9PiBBcnJheTxNYXRjaD4uXG4gIGNvbnN0IG1hdGNoZXNCeUZpbGU6IE1hcDxzdHJpbmcsIEFycmF5PHNlYXJjaCRNYXRjaD4+ID0gbmV3IE1hcCgpO1xuXG4gIGlmICghc3ViZGlycyB8fCBzdWJkaXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vIFNpbmNlIG5vIHN1YmRpcnMgd2VyZSBzcGVjaWZpZWQsIHJ1biBzZWFyY2ggb24gdGhlIHJvb3QgZGlyZWN0b3J5LlxuICAgIHJldHVybiBzZWFyY2hJblN1YmRpcihtYXRjaGVzQnlGaWxlLCBkaXJlY3RvcnksICcuJywgcmVnZXgpO1xuICB9IGVsc2Uge1xuICAgIC8vIFJ1biB0aGUgc2VhcmNoIG9uIGVhY2ggc3ViZGlyZWN0b3J5IHRoYXQgZXhpc3RzLlxuICAgIHJldHVybiBPYnNlcnZhYmxlLmZyb20oc3ViZGlycykuY29uY2F0TWFwKGFzeW5jIHN1YmRpciA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGF0ID0gYXdhaXQgZnNQcm9taXNlLmxzdGF0KHBhdGguam9pbihkaXJlY3RvcnksIHN1YmRpcikpO1xuICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHNlYXJjaEluU3ViZGlyKG1hdGNoZXNCeUZpbGUsIGRpcmVjdG9yeSwgc3ViZGlyLCByZWdleCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIE9ic2VydmFibGUuZW1wdHkoKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gT2JzZXJ2YWJsZS5lbXB0eSgpO1xuICAgICAgfVxuICAgIH0pLm1lcmdlQWxsKCk7XG4gIH1cbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRoYXQgcnVucyB0aGUgc2VhcmNoIGNvbW1hbmQgb24gdGhlIGdpdmVuIGRpcmVjdG9yeVxuLy8gYHN1YmRpcmAsIHJlbGF0aXZlIHRvIGBkaXJlY3RvcnlgLiBUaGUgZnVuY3Rpb24gcmV0dXJucyBhbiBPYnNlcnZhYmxlIHRoYXQgZW1pdHNcbi8vIHNlYXJjaCRGaWxlUmVzdWx0IG9iamVjdHMuXG5mdW5jdGlvbiBzZWFyY2hJblN1YmRpcihcbiAgbWF0Y2hlc0J5RmlsZTogTWFwPHN0cmluZywgQXJyYXk8c2VhcmNoJE1hdGNoPj4sXG4gIGRpcmVjdG9yeTogc3RyaW5nLFxuICBzdWJkaXI6IHN0cmluZyxcbiAgcmVnZXg6IFJlZ0V4cFxuKTogT2JzZXJ2YWJsZTxzZWFyY2gkRmlsZVJlc3VsdD4ge1xuICAvLyBUcnkgcnVubmluZyBzZWFyY2ggY29tbWFuZHMsIGZhbGxpbmcgdGhyb3VnaCB0byB0aGUgbmV4dCBpZiB0aGVyZSBpcyBhbiBlcnJvci5cbiAgY29uc3QgdmNzYXJncyA9IChyZWdleC5pZ25vcmVDYXNlID8gWyctaSddIDogW10pLmNvbmNhdChbJy1uJywgcmVnZXguc291cmNlXSk7XG4gIGNvbnN0IGdyZXBhcmdzID0gKHJlZ2V4Lmlnbm9yZUNhc2UgPyBbJy1pJ10gOiBbXSkuY29uY2F0KFsnLXJIbicsICctZScsIHJlZ2V4LnNvdXJjZSwgJy4nXSk7XG4gIGNvbnN0IGNtZERpciA9IHBhdGguam9pbihkaXJlY3RvcnksIHN1YmRpcik7XG4gIGNvbnN0IGxpbmVzU291cmNlID0gT2JzZXJ2YWJsZS5jYXRjaChcbiAgICBnZXRMaW5lc0Zyb21Db21tYW5kKCdoZycsIFsnd2dyZXAnXS5jb25jYXQodmNzYXJncyksIGNtZERpciksXG4gICAgZ2V0TGluZXNGcm9tQ29tbWFuZCgnZ2l0JywgWydncmVwJ10uY29uY2F0KHZjc2FyZ3MpLCBjbWREaXIpLFxuICAgIGdldExpbmVzRnJvbUNvbW1hbmQoJ2dyZXAnLCBncmVwYXJncywgY21kRGlyKSxcbiAgICBPYnNlcnZhYmxlLnRocm93KG5ldyBFcnJvcignRmFpbGVkIHRvIGV4ZWN1dGUgYSBncmVwIHNlYXJjaC4nKSlcbiAgKTtcblxuICAvLyBUcmFuc2Zvcm0gbGluZXMgaW50byBmaWxlIG1hdGNoZXMuXG4gIHJldHVybiBsaW5lc1NvdXJjZS5mbGF0TWFwKGxpbmUgPT4ge1xuICAgIC8vIFRyeSB0byBwYXJzZSB0aGUgb3V0cHV0IG9mIGdyZXAuXG4gICAgY29uc3QgZ3JlcE1hdGNoUmVzdWx0ID0gbGluZS5tYXRjaChHUkVQX1BBUlNFX1BBVFRFUk4pO1xuICAgIGlmICghZ3JlcE1hdGNoUmVzdWx0KSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8gRXh0cmFjdCB0aGUgZmlsZW5hbWUsIGxpbmUgbnVtYmVyLCBhbmQgbGluZSB0ZXh0IGZyb20gZ3JlcCBvdXRwdXQuXG4gICAgY29uc3QgbGluZVRleHQgPSBncmVwTWF0Y2hSZXN1bHRbM107XG4gICAgY29uc3QgbGluZU5vID0gcGFyc2VJbnQoZ3JlcE1hdGNoUmVzdWx0WzJdLCAxMCkgLSAxO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHN1YmRpciwgZ3JlcE1hdGNoUmVzdWx0WzFdKTtcblxuICAgIC8vIFRyeSB0byBleHRyYWN0IHRoZSBhY3R1YWwgXCJtYXRjaGVkXCIgdGV4dC5cbiAgICBjb25zdCBtYXRjaFRleHRSZXN1bHQgPSByZWdleC5leGVjKGxpbmVUZXh0KTtcbiAgICBpZiAoIW1hdGNoVGV4dFJlc3VsdCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBtYXRjaFRleHQgPSBtYXRjaFRleHRSZXN1bHRbMF07XG4gICAgY29uc3QgbWF0Y2hJbmRleCA9IG1hdGNoVGV4dFJlc3VsdC5pbmRleDtcblxuICAgIC8vIFB1dCB0aGlzIG1hdGNoIGludG8gbGlzdHMgZ3JvdXBlZCBieSBmaWxlcy5cbiAgICBsZXQgbWF0Y2hlcyA9IG1hdGNoZXNCeUZpbGUuZ2V0KGZpbGVQYXRoKTtcbiAgICBpZiAobWF0Y2hlcyA9PSBudWxsKSB7XG4gICAgICBtYXRjaGVzID0gW107XG4gICAgICBtYXRjaGVzQnlGaWxlLnNldChmaWxlUGF0aCwgbWF0Y2hlcyk7XG4gICAgfVxuICAgIG1hdGNoZXMucHVzaCh7XG4gICAgICBsaW5lVGV4dCxcbiAgICAgIGxpbmVUZXh0T2Zmc2V0OiAwLFxuICAgICAgbWF0Y2hUZXh0LFxuICAgICAgcmFuZ2U6IFtbbGluZU5vLCBtYXRjaEluZGV4XSwgW2xpbmVObywgbWF0Y2hJbmRleCArIG1hdGNoVGV4dC5sZW5ndGhdXSxcbiAgICB9KTtcblxuICAgIC8vIElmIGEgY2FsbGJhY2sgd2FzIHByb3ZpZGVkLCBpbnZva2UgaXQgd2l0aCB0aGUgbmV3ZXN0IHVwZGF0ZS5cbiAgICByZXR1cm4gW3ttYXRjaGVzLCBmaWxlUGF0aH1dO1xuICB9KTtcbn1cblxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdGhhdCBydW5zIGEgY29tbWFuZCBpbiBhIGdpdmVuIGRpcmVjdG9yeSwgaW52b2tpbmcgYSBjYWxsYmFja1xuLy8gYXMgZWFjaCBsaW5lIGlzIHdyaXR0ZW4gdG8gc3Rkb3V0LlxuZnVuY3Rpb24gZ2V0TGluZXNGcm9tQ29tbWFuZChjb21tYW5kOiBzdHJpbmcsIGFyZ3M6IEFycmF5PHN0cmluZz4sIGxvY2FsRGlyZWN0b3J5UGF0aDogc3RyaW5nKTpcbiAgICBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICByZXR1cm4gT2JzZXJ2YWJsZS5jcmVhdGUob2JzZXJ2ZXIgPT4ge1xuICAgIGxldCBwcm9jOiA/Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MgPSBudWxsO1xuICAgIGxldCBleGl0ZWQgPSBmYWxzZTtcblxuICAgIC8vIFNwYXduIHRoZSBzZWFyY2ggY29tbWFuZCBpbiB0aGUgZ2l2ZW4gZGlyZWN0b3J5LlxuICAgIHNhZmVTcGF3bihjb21tYW5kLCBhcmdzLCB7Y3dkOiBsb2NhbERpcmVjdG9yeVBhdGh9KS50aGVuKGNoaWxkID0+IHtcbiAgICAgIHByb2MgPSBjaGlsZDtcblxuICAgICAgLy8gUmVqZWN0IG9uIGVycm9yLlxuICAgICAgcHJvYy5vbignZXJyb3InLCBvYnNlcnZlci5vbkVycm9yLmJpbmQob2JzZXJ2ZXIpKTtcblxuICAgICAgLy8gQ2FsbCB0aGUgY2FsbGJhY2sgb24gZWFjaCBsaW5lLlxuICAgICAgcHJvYy5zdGRvdXQucGlwZShzcGxpdCgpKS5vbignZGF0YScsIG9ic2VydmVyLm9uTmV4dC5iaW5kKG9ic2VydmVyKSk7XG5cbiAgICAgIC8vIEtlZXAgYSBydW5uaW5nIHN0cmluZyBvZiBzdGRlcnIsIGluIGNhc2Ugd2UgbmVlZCB0byB0aHJvdyBhbiBlcnJvci5cbiAgICAgIGxldCBzdGRlcnIgPSAnJztcbiAgICAgIHByb2Muc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgIHN0ZGVyciArPSBkYXRhO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFJlc29sdmUgcHJvbWlzZSBpZiBlcnJvciBjb2RlIGlzIDAgKGZvdW5kIG1hdGNoZXMpIG9yIDEgKGZvdW5kIG5vIG1hdGNoZXMpLiBPdGhlcndpc2VcbiAgICAgIC8vIHJlamVjdC4gSG93ZXZlciwgaWYgYSBwcm9jZXNzIHdhcyBraWxsZWQgd2l0aCBhIHNpZ25hbCwgZG9uJ3QgcmVqZWN0LCBzaW5jZSB0aGlzIHdhcyBsaWtlbHlcbiAgICAgIC8vIHRvIGNhbmNlbCB0aGUgc2VhcmNoLlxuICAgICAgcHJvYy5vbignY2xvc2UnLCAoY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAgIGV4aXRlZCA9IHRydWU7XG4gICAgICAgIGlmIChzaWduYWwgfHwgY29kZSA8PSAxKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYnNlcnZlci5vbkVycm9yKG5ldyBFcnJvcihzdGRlcnIpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgb2JzZXJ2ZXIub25FcnJvcihlcnJvcik7XG4gICAgfSk7XG5cbiAgICAvLyBLaWxsIHRoZSBzZWFyY2ggcHJvY2VzcyBvbiBkaXNwb3NlLlxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoIWV4aXRlZCkge1xuICAgICAgICBwcm9jICYmIHByb2Mua2lsbCgpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufVxuIl19