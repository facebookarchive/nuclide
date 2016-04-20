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

var _reactivexRxjs = require('@reactivex/rxjs');

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
    return _reactivexRxjs.Observable.from(subdirs).concatMap(_asyncToGenerator(function* (subdir) {
      try {
        var stat = yield _nuclideCommons.fsPromise.lstat(_path2['default'].join(directory, subdir));
        if (stat.isDirectory()) {
          return searchInSubdir(matchesByFile, directory, subdir, regex);
        } else {
          return _reactivexRxjs.Observable.empty();
        }
      } catch (e) {
        return _reactivexRxjs.Observable.empty();
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
  var linesSource = getLinesFromCommand('hg', ['wgrep'].concat(vcsargs), cmdDir)['catch'](function () {
    return getLinesFromCommand('git', ['grep'].concat(vcsargs), cmdDir);
  })['catch'](function () {
    return getLinesFromCommand('grep', grepargs, cmdDir);
  })['catch'](function () {
    return _reactivexRxjs.Observable['throw'](new Error('Failed to execute a grep search.'));
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
    var filePath = _path2['default'].join(subdir, grepMatchResult[1]);

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
  return _reactivexRxjs.Observable.create(function (observer) {
    var proc = null;
    var exited = false;

    // Spawn the search command in the given directory.
    (0, _nuclideCommons.safeSpawn)(command, args, { cwd: localDirectoryPath }).then(function (child) {
      proc = child;

      // Reject on error.
      proc.on('error', observer.error.bind(observer));

      // Call the callback on each line.
      proc.stdout.pipe((0, _split2['default'])()).on('data', observer.next.bind(observer));

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
    })['catch'](function (error) {
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
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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S0FBSyxFQUFJO0FBQ2hCLGNBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDdkIsQ0FBQyxDQUFDOzs7QUFHSCxXQUFPLFlBQU07QUFDWCxVQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsWUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNyQjtLQUNGLENBQUM7R0FDSCxDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJzY2FuaGFuZGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgc2VhcmNoJEZpbGVSZXN1bHQsXG4gIHNlYXJjaCRNYXRjaCxcbn0gZnJvbSAnLi4nO1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5cbmltcG9ydCB7XG4gIGZzUHJvbWlzZSxcbiAgc2FmZVNwYXduLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgc3BsaXQgZnJvbSAnc3BsaXQnO1xuXG4vLyBUaGlzIHBhdHRlcm4gaXMgdXNlZCBmb3IgcGFyc2luZyB0aGUgb3V0cHV0IG9mIGdyZXAuXG5jb25zdCBHUkVQX1BBUlNFX1BBVFRFUk4gPSAvKC4qPyk6KFxcZCopOiguKikvO1xuXG4vKipcbiAqIFNlYXJjaGVzIGZvciBhbGwgaW5zdGFuY2VzIG9mIGEgcGF0dGVybiBpbiBhIGRpcmVjdG9yeS5cbiAqIEBwYXJhbSBkaXJlY3RvcnkgLSBUaGUgZGlyZWN0b3J5IGluIHdoaWNoIHRvIHBlcmZvcm0gYSBzZWFyY2guXG4gKiBAcGFyYW0gcmVnZXggLSBUaGUgcGF0dGVybiB0byBtYXRjaC5cbiAqIEBwYXJhbSBzdWJkaXJzIC0gQW4gYXJyYXkgb2Ygc3ViZGlyZWN0b3JpZXMgdG8gc2VhcmNoIHdpdGhpbiBgZGlyZWN0b3J5YC4gSWYgc3ViZGlycyBpcyBhblxuICogICBlbXB0eSBhcnJheSwgdGhlbiBzaW1wbHkgc2VhcmNoIGluIGRpcmVjdG9yeS5cbiAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyBtYXRjaCBldmVudHMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNlYXJjaChkaXJlY3Rvcnk6IHN0cmluZywgcmVnZXg6IFJlZ0V4cCwgc3ViZGlyczogQXJyYXk8c3RyaW5nPik6XG4gICAgT2JzZXJ2YWJsZTxzZWFyY2gkRmlsZVJlc3VsdD4ge1xuICAvLyBNYXRjaGVzIGFyZSBzdG9yZWQgaW4gYSBNYXAgb2YgZmlsZW5hbWUgPT4gQXJyYXk8TWF0Y2g+LlxuICBjb25zdCBtYXRjaGVzQnlGaWxlOiBNYXA8c3RyaW5nLCBBcnJheTxzZWFyY2gkTWF0Y2g+PiA9IG5ldyBNYXAoKTtcblxuICBpZiAoIXN1YmRpcnMgfHwgc3ViZGlycy5sZW5ndGggPT09IDApIHtcbiAgICAvLyBTaW5jZSBubyBzdWJkaXJzIHdlcmUgc3BlY2lmaWVkLCBydW4gc2VhcmNoIG9uIHRoZSByb290IGRpcmVjdG9yeS5cbiAgICByZXR1cm4gc2VhcmNoSW5TdWJkaXIobWF0Y2hlc0J5RmlsZSwgZGlyZWN0b3J5LCAnLicsIHJlZ2V4KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBSdW4gdGhlIHNlYXJjaCBvbiBlYWNoIHN1YmRpcmVjdG9yeSB0aGF0IGV4aXN0cy5cbiAgICByZXR1cm4gT2JzZXJ2YWJsZS5mcm9tKHN1YmRpcnMpLmNvbmNhdE1hcChhc3luYyBzdWJkaXIgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3RhdCA9IGF3YWl0IGZzUHJvbWlzZS5sc3RhdChwYXRoLmpvaW4oZGlyZWN0b3J5LCBzdWJkaXIpKTtcbiAgICAgICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIHJldHVybiBzZWFyY2hJblN1YmRpcihtYXRjaGVzQnlGaWxlLCBkaXJlY3RvcnksIHN1YmRpciwgcmVnZXgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBPYnNlcnZhYmxlLmVtcHR5KCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIE9ic2VydmFibGUuZW1wdHkoKTtcbiAgICAgIH1cbiAgICB9KS5tZXJnZUFsbCgpO1xuICB9XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJ1bnMgdGhlIHNlYXJjaCBjb21tYW5kIG9uIHRoZSBnaXZlbiBkaXJlY3Rvcnlcbi8vIGBzdWJkaXJgLCByZWxhdGl2ZSB0byBgZGlyZWN0b3J5YC4gVGhlIGZ1bmN0aW9uIHJldHVybnMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzXG4vLyBzZWFyY2gkRmlsZVJlc3VsdCBvYmplY3RzLlxuZnVuY3Rpb24gc2VhcmNoSW5TdWJkaXIoXG4gIG1hdGNoZXNCeUZpbGU6IE1hcDxzdHJpbmcsIEFycmF5PHNlYXJjaCRNYXRjaD4+LFxuICBkaXJlY3Rvcnk6IHN0cmluZyxcbiAgc3ViZGlyOiBzdHJpbmcsXG4gIHJlZ2V4OiBSZWdFeHBcbik6IE9ic2VydmFibGU8c2VhcmNoJEZpbGVSZXN1bHQ+IHtcbiAgLy8gVHJ5IHJ1bm5pbmcgc2VhcmNoIGNvbW1hbmRzLCBmYWxsaW5nIHRocm91Z2ggdG8gdGhlIG5leHQgaWYgdGhlcmUgaXMgYW4gZXJyb3IuXG4gIGNvbnN0IHZjc2FyZ3MgPSAocmVnZXguaWdub3JlQ2FzZSA/IFsnLWknXSA6IFtdKS5jb25jYXQoWyctbicsIHJlZ2V4LnNvdXJjZV0pO1xuICBjb25zdCBncmVwYXJncyA9IChyZWdleC5pZ25vcmVDYXNlID8gWyctaSddIDogW10pLmNvbmNhdChbJy1ySG4nLCAnLWUnLCByZWdleC5zb3VyY2UsICcuJ10pO1xuICBjb25zdCBjbWREaXIgPSBwYXRoLmpvaW4oZGlyZWN0b3J5LCBzdWJkaXIpO1xuICBjb25zdCBsaW5lc1NvdXJjZSA9XG4gICAgZ2V0TGluZXNGcm9tQ29tbWFuZCgnaGcnLCBbJ3dncmVwJ10uY29uY2F0KHZjc2FyZ3MpLCBjbWREaXIpXG4gICAgLmNhdGNoKCgpID0+IGdldExpbmVzRnJvbUNvbW1hbmQoJ2dpdCcsIFsnZ3JlcCddLmNvbmNhdCh2Y3NhcmdzKSwgY21kRGlyKSlcbiAgICAuY2F0Y2goKCkgPT4gZ2V0TGluZXNGcm9tQ29tbWFuZCgnZ3JlcCcsIGdyZXBhcmdzLCBjbWREaXIpKVxuICAgIC5jYXRjaCgoKSA9PiBPYnNlcnZhYmxlLnRocm93KG5ldyBFcnJvcignRmFpbGVkIHRvIGV4ZWN1dGUgYSBncmVwIHNlYXJjaC4nKSkpO1xuXG4gIC8vIFRyYW5zZm9ybSBsaW5lcyBpbnRvIGZpbGUgbWF0Y2hlcy5cbiAgcmV0dXJuIGxpbmVzU291cmNlLmZsYXRNYXAobGluZSA9PiB7XG4gICAgLy8gVHJ5IHRvIHBhcnNlIHRoZSBvdXRwdXQgb2YgZ3JlcC5cbiAgICBjb25zdCBncmVwTWF0Y2hSZXN1bHQgPSBsaW5lLm1hdGNoKEdSRVBfUEFSU0VfUEFUVEVSTik7XG4gICAgaWYgKCFncmVwTWF0Y2hSZXN1bHQpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvLyBFeHRyYWN0IHRoZSBmaWxlbmFtZSwgbGluZSBudW1iZXIsIGFuZCBsaW5lIHRleHQgZnJvbSBncmVwIG91dHB1dC5cbiAgICBjb25zdCBsaW5lVGV4dCA9IGdyZXBNYXRjaFJlc3VsdFszXTtcbiAgICBjb25zdCBsaW5lTm8gPSBwYXJzZUludChncmVwTWF0Y2hSZXN1bHRbMl0sIDEwKSAtIDE7XG4gICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oc3ViZGlyLCBncmVwTWF0Y2hSZXN1bHRbMV0pO1xuXG4gICAgLy8gVHJ5IHRvIGV4dHJhY3QgdGhlIGFjdHVhbCBcIm1hdGNoZWRcIiB0ZXh0LlxuICAgIGNvbnN0IG1hdGNoVGV4dFJlc3VsdCA9IHJlZ2V4LmV4ZWMobGluZVRleHQpO1xuICAgIGlmICghbWF0Y2hUZXh0UmVzdWx0KSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8gSU1QT1JUQU5UOiByZXNldCB0aGUgcmVnZXggZm9yIHRoZSBuZXh0IHNlYXJjaFxuICAgIHJlZ2V4Lmxhc3RJbmRleCA9IDA7XG5cbiAgICBjb25zdCBtYXRjaFRleHQgPSBtYXRjaFRleHRSZXN1bHRbMF07XG4gICAgY29uc3QgbWF0Y2hJbmRleCA9IG1hdGNoVGV4dFJlc3VsdC5pbmRleDtcblxuICAgIC8vIFB1dCB0aGlzIG1hdGNoIGludG8gbGlzdHMgZ3JvdXBlZCBieSBmaWxlcy5cbiAgICBsZXQgbWF0Y2hlcyA9IG1hdGNoZXNCeUZpbGUuZ2V0KGZpbGVQYXRoKTtcbiAgICBpZiAobWF0Y2hlcyA9PSBudWxsKSB7XG4gICAgICBtYXRjaGVzID0gW107XG4gICAgICBtYXRjaGVzQnlGaWxlLnNldChmaWxlUGF0aCwgbWF0Y2hlcyk7XG4gICAgfVxuICAgIG1hdGNoZXMucHVzaCh7XG4gICAgICBsaW5lVGV4dCxcbiAgICAgIGxpbmVUZXh0T2Zmc2V0OiAwLFxuICAgICAgbWF0Y2hUZXh0LFxuICAgICAgcmFuZ2U6IFtbbGluZU5vLCBtYXRjaEluZGV4XSwgW2xpbmVObywgbWF0Y2hJbmRleCArIG1hdGNoVGV4dC5sZW5ndGhdXSxcbiAgICB9KTtcblxuICAgIC8vIElmIGEgY2FsbGJhY2sgd2FzIHByb3ZpZGVkLCBpbnZva2UgaXQgd2l0aCB0aGUgbmV3ZXN0IHVwZGF0ZS5cbiAgICByZXR1cm4gW3ttYXRjaGVzLCBmaWxlUGF0aH1dO1xuICB9KTtcbn1cblxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdGhhdCBydW5zIGEgY29tbWFuZCBpbiBhIGdpdmVuIGRpcmVjdG9yeSwgaW52b2tpbmcgYSBjYWxsYmFja1xuLy8gYXMgZWFjaCBsaW5lIGlzIHdyaXR0ZW4gdG8gc3Rkb3V0LlxuZnVuY3Rpb24gZ2V0TGluZXNGcm9tQ29tbWFuZChjb21tYW5kOiBzdHJpbmcsIGFyZ3M6IEFycmF5PHN0cmluZz4sIGxvY2FsRGlyZWN0b3J5UGF0aDogc3RyaW5nKTpcbiAgICBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICByZXR1cm4gT2JzZXJ2YWJsZS5jcmVhdGUob2JzZXJ2ZXIgPT4ge1xuICAgIGxldCBwcm9jOiA/Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MgPSBudWxsO1xuICAgIGxldCBleGl0ZWQgPSBmYWxzZTtcblxuICAgIC8vIFNwYXduIHRoZSBzZWFyY2ggY29tbWFuZCBpbiB0aGUgZ2l2ZW4gZGlyZWN0b3J5LlxuICAgIHNhZmVTcGF3bihjb21tYW5kLCBhcmdzLCB7Y3dkOiBsb2NhbERpcmVjdG9yeVBhdGh9KS50aGVuKGNoaWxkID0+IHtcbiAgICAgIHByb2MgPSBjaGlsZDtcblxuICAgICAgLy8gUmVqZWN0IG9uIGVycm9yLlxuICAgICAgcHJvYy5vbignZXJyb3InLCBvYnNlcnZlci5lcnJvci5iaW5kKG9ic2VydmVyKSk7XG5cbiAgICAgIC8vIENhbGwgdGhlIGNhbGxiYWNrIG9uIGVhY2ggbGluZS5cbiAgICAgIHByb2Muc3Rkb3V0LnBpcGUoc3BsaXQoKSkub24oJ2RhdGEnLCBvYnNlcnZlci5uZXh0LmJpbmQob2JzZXJ2ZXIpKTtcblxuICAgICAgLy8gS2VlcCBhIHJ1bm5pbmcgc3RyaW5nIG9mIHN0ZGVyciwgaW4gY2FzZSB3ZSBuZWVkIHRvIHRocm93IGFuIGVycm9yLlxuICAgICAgbGV0IHN0ZGVyciA9ICcnO1xuICAgICAgcHJvYy5zdGRlcnIub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgICAgc3RkZXJyICs9IGRhdGE7XG4gICAgICB9KTtcblxuICAgICAgLy8gUmVzb2x2ZSBwcm9taXNlIGlmIGVycm9yIGNvZGUgaXMgMCAoZm91bmQgbWF0Y2hlcykgb3IgMSAoZm91bmQgbm8gbWF0Y2hlcykuIE90aGVyd2lzZVxuICAgICAgLy8gcmVqZWN0LiBIb3dldmVyLCBpZiBhIHByb2Nlc3Mgd2FzIGtpbGxlZCB3aXRoIGEgc2lnbmFsLCBkb24ndCByZWplY3QsIHNpbmNlIHRoaXMgd2FzIGxpa2VseVxuICAgICAgLy8gdG8gY2FuY2VsIHRoZSBzZWFyY2guXG4gICAgICBwcm9jLm9uKCdjbG9zZScsIChjb2RlLCBzaWduYWwpID0+IHtcbiAgICAgICAgZXhpdGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKHNpZ25hbCB8fCBjb2RlIDw9IDEpIHtcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBFcnJvcihzdGRlcnIpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgIH0pO1xuXG4gICAgLy8gS2lsbCB0aGUgc2VhcmNoIHByb2Nlc3Mgb24gZGlzcG9zZS5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKCFleGl0ZWQpIHtcbiAgICAgICAgcHJvYyAmJiBwcm9jLmtpbGwoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn1cbiJdfQ==