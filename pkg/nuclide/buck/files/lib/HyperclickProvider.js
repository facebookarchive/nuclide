

/**
 * Takes target regex match and file path where given target is found as
 * arguments.
 * Returns target as object with path and name properties.
 * For example, input match
 * ['//Apps/MyApp:MyTarget', '//Apps/MyApp', 'MyTarget'] would be parsed to
 * {path: //Apps/MyApp/BUCK, name: MyTarget} and ':MyTarget' would be
 * parsed to {path: filePath, name: MyTarget}.
 * Returns null if target cannot be parsed from given arguments.
 */

var parseTarget = _asyncToGenerator(function* (match, filePath, buckProject) {
  if (!match || !filePath) {
    return null;
  }

  var path = undefined;
  var fullTarget = match[1];
  if (fullTarget) {
    // Strip off the leading slashes from the fully-qualified build target.
    var basePath = fullTarget.substring('//'.length);
    var buckRoot = yield buckProject.getPath();
    path = require('../../../remote-uri').join(buckRoot, basePath, 'BUCK');
  } else {
    // filePath is already an absolute path.
    path = filePath;
  }
  var name = match[2];
  if (!name) {
    return null;
  }
  return { path: path, name: name };
}

/**
 * Takes a target as an argument.
 * Returns a Promise that resolves to a target location.
 * If the exact position the target in the file cannot be determined
 * position property of the target location will be set to null.
 * If `target.path` file cannot be found or read, Promise resolves to null.
 */
);

var findTargetLocation = _asyncToGenerator(function* (target) {
  var data = undefined;
  try {
    data = yield fsPromise.readFile(target.path, 'utf-8');
  } catch (e) {
    return null;
  }

  // We split the file content into lines and look for the line that looks
  // like "name = '#{target.name}'" ignoring whitespaces and trailling
  // comma.
  var lines = data.split('\n');
  var regex = new RegExp('^\\s*' + // beginning of the line
  'name\\s*=\\s*' + // name =
  '[\'\"]' + // opening quotation mark
  escapeRegExp(target.name) + // target name
  '[\'\"]' + // closing quotation mark
  ',?$' // optional trailling comma
  );

  var lineIndex = 0;
  lines.forEach(function (line, i) {
    if (regex.test(line)) {
      lineIndex = i;
    }
  });

  return { path: target.path, line: lineIndex, column: 0 };
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('../../base');

var isBuckFile = _require.isBuckFile;

var _require2 = require('../../commons');

var buckProjectRootForPath = _require2.buckProjectRootForPath;

var _require3 = require('../../../commons');

var fsPromise = _require3.fsPromise;

var _require4 = require('../../../atom-helpers');

var goToLocation = _require4.goToLocation;
var extractWordAtPosition = _require4.extractWordAtPosition;

var targetRegex = /(\/(?:\/[\w\-\.]*)*){0,1}:([\w\-\.]+)/;

var ESCAPE_REGEXP = /([.*+?^${}()|\[\]\/\\])/g;

function escapeRegExp(str) {
  return str.replace(ESCAPE_REGEXP, '\\$1');
}

module.exports = {
  priority: 50,
  providerName: 'nuclide-buck-files',
  getSuggestion: _asyncToGenerator(function* (textEditor, position) {
    var absolutePath = textEditor.getPath();
    if (!absolutePath) {
      return null;
    }

    if (!isBuckFile(absolutePath)) {
      return null;
    }

    var buckProject = yield buckProjectRootForPath(absolutePath);
    if (!buckProject) {
      return null;
    }

    var wordMatchAndRange = extractWordAtPosition(textEditor, position, targetRegex);
    if (!wordMatchAndRange) {
      return null;
    }
    var wordMatch = wordMatchAndRange.wordMatch;
    var range = wordMatchAndRange.range;

    var target = yield parseTarget(wordMatch, absolutePath, buckProject);
    if (!target) {
      return null;
    }
    var location = yield findTargetLocation(target);
    if (location) {
      return {
        range: range,
        callback: function callback() {
          goToLocation(location.path, location.line, location.column);
        }
      };
    } else {
      return null;
    }
  }),
  parseTarget: parseTarget,
  findTargetLocation: findTargetLocation
};
//# sourceMappingURL=data:application/json;base64,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LENBQUM7S0FDSCxNQUFNO0FBQ0wsYUFBTyxJQUFJLENBQUM7S0FDYjtHQUNGLENBQUE7QUFDRCxhQUFXLEVBQVgsV0FBVztBQUNYLG9CQUFrQixFQUFsQixrQkFBa0I7Q0FDbkIsQ0FBQyIsImZpbGUiOiJIeXBlcmNsaWNrUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG50eXBlIFRhcmdldCA9IHtwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZ307XG5cbmltcG9ydCB0eXBlIHtCdWNrUHJvamVjdH0gZnJvbSAnLi4vLi4vYmFzZS9saWIvQnVja1Byb2plY3QnO1xuXG5jb25zdCB7aXNCdWNrRmlsZX0gPSByZXF1aXJlKCcuLi8uLi9iYXNlJyk7XG5jb25zdCB7YnVja1Byb2plY3RSb290Rm9yUGF0aH0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJyk7XG5jb25zdCB7ZnNQcm9taXNlfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbnMnKTtcbmNvbnN0IHtnb1RvTG9jYXRpb24sIGV4dHJhY3RXb3JkQXRQb3NpdGlvbn0gPSByZXF1aXJlKCcuLi8uLi8uLi9hdG9tLWhlbHBlcnMnKTtcblxuaW1wb3J0IHR5cGUge1BvaW50fSBmcm9tICdhdG9tJztcblxuY29uc3QgdGFyZ2V0UmVnZXggPSAvKFxcLyg/OlxcL1tcXHdcXC1cXC5dKikqKXswLDF9OihbXFx3XFwtXFwuXSspLztcblxuY29uc3QgRVNDQVBFX1JFR0VYUCA9IC8oWy4qKz9eJHt9KCl8XFxbXFxdXFwvXFxcXF0pL2c7XG5cbmZ1bmN0aW9uIGVzY2FwZVJlZ0V4cChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHIucmVwbGFjZShFU0NBUEVfUkVHRVhQLCAnXFxcXCQxJyk7XG59XG5cbi8qKlxuICogVGFrZXMgdGFyZ2V0IHJlZ2V4IG1hdGNoIGFuZCBmaWxlIHBhdGggd2hlcmUgZ2l2ZW4gdGFyZ2V0IGlzIGZvdW5kIGFzXG4gKiBhcmd1bWVudHMuXG4gKiBSZXR1cm5zIHRhcmdldCBhcyBvYmplY3Qgd2l0aCBwYXRoIGFuZCBuYW1lIHByb3BlcnRpZXMuXG4gKiBGb3IgZXhhbXBsZSwgaW5wdXQgbWF0Y2hcbiAqIFsnLy9BcHBzL015QXBwOk15VGFyZ2V0JywgJy8vQXBwcy9NeUFwcCcsICdNeVRhcmdldCddIHdvdWxkIGJlIHBhcnNlZCB0b1xuICoge3BhdGg6IC8vQXBwcy9NeUFwcC9CVUNLLCBuYW1lOiBNeVRhcmdldH0gYW5kICc6TXlUYXJnZXQnIHdvdWxkIGJlXG4gKiBwYXJzZWQgdG8ge3BhdGg6IGZpbGVQYXRoLCBuYW1lOiBNeVRhcmdldH0uXG4gKiBSZXR1cm5zIG51bGwgaWYgdGFyZ2V0IGNhbm5vdCBiZSBwYXJzZWQgZnJvbSBnaXZlbiBhcmd1bWVudHMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHBhcnNlVGFyZ2V0KFxuICBtYXRjaDogQXJyYXk8P3N0cmluZz4sXG4gIGZpbGVQYXRoOiA/c3RyaW5nLFxuICBidWNrUHJvamVjdDogQnVja1Byb2plY3QsXG4pOiBQcm9taXNlPD9UYXJnZXQ+IHtcbiAgaWYgKCFtYXRjaCB8fCAhZmlsZVBhdGgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBwYXRoO1xuICBjb25zdCBmdWxsVGFyZ2V0ID0gbWF0Y2hbMV07XG4gIGlmIChmdWxsVGFyZ2V0KSB7XG4gICAgLy8gU3RyaXAgb2ZmIHRoZSBsZWFkaW5nIHNsYXNoZXMgZnJvbSB0aGUgZnVsbHktcXVhbGlmaWVkIGJ1aWxkIHRhcmdldC5cbiAgICBjb25zdCBiYXNlUGF0aCA9IGZ1bGxUYXJnZXQuc3Vic3RyaW5nKCcvLycubGVuZ3RoKTtcbiAgICBjb25zdCBidWNrUm9vdCA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmdldFBhdGgoKTtcbiAgICBwYXRoID0gcmVxdWlyZSgnLi4vLi4vLi4vcmVtb3RlLXVyaScpLmpvaW4oYnVja1Jvb3QsIGJhc2VQYXRoLCAnQlVDSycpO1xuICB9IGVsc2Uge1xuICAgIC8vIGZpbGVQYXRoIGlzIGFscmVhZHkgYW4gYWJzb2x1dGUgcGF0aC5cbiAgICBwYXRoID0gZmlsZVBhdGg7XG4gIH1cbiAgY29uc3QgbmFtZSA9IG1hdGNoWzJdO1xuICBpZiAoIW5hbWUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ge3BhdGgsIG5hbWV9O1xufVxuXG4vKipcbiAqIFRha2VzIGEgdGFyZ2V0IGFzIGFuIGFyZ3VtZW50LlxuICogUmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHRhcmdldCBsb2NhdGlvbi5cbiAqIElmIHRoZSBleGFjdCBwb3NpdGlvbiB0aGUgdGFyZ2V0IGluIHRoZSBmaWxlIGNhbm5vdCBiZSBkZXRlcm1pbmVkXG4gKiBwb3NpdGlvbiBwcm9wZXJ0eSBvZiB0aGUgdGFyZ2V0IGxvY2F0aW9uIHdpbGwgYmUgc2V0IHRvIG51bGwuXG4gKiBJZiBgdGFyZ2V0LnBhdGhgIGZpbGUgY2Fubm90IGJlIGZvdW5kIG9yIHJlYWQsIFByb21pc2UgcmVzb2x2ZXMgdG8gbnVsbC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmluZFRhcmdldExvY2F0aW9uKHRhcmdldDogVGFyZ2V0KTogUHJvbWlzZSB7XG4gIGxldCBkYXRhO1xuICB0cnkge1xuICAgIGRhdGEgPSBhd2FpdCBmc1Byb21pc2UucmVhZEZpbGUodGFyZ2V0LnBhdGgsICd1dGYtOCcpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBXZSBzcGxpdCB0aGUgZmlsZSBjb250ZW50IGludG8gbGluZXMgYW5kIGxvb2sgZm9yIHRoZSBsaW5lIHRoYXQgbG9va3NcbiAgLy8gbGlrZSBcIm5hbWUgPSAnI3t0YXJnZXQubmFtZX0nXCIgaWdub3Jpbmcgd2hpdGVzcGFjZXMgYW5kIHRyYWlsbGluZ1xuICAvLyBjb21tYS5cbiAgY29uc3QgbGluZXMgPSBkYXRhLnNwbGl0KCdcXG4nKTtcbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKFxuICAgICAgJ15cXFxccyonICsgLy8gYmVnaW5uaW5nIG9mIHRoZSBsaW5lXG4gICAgICAnbmFtZVxcXFxzKj1cXFxccyonICsgLy8gbmFtZSA9XG4gICAgICAnW1xcJ1xcXCJdJyArIC8vIG9wZW5pbmcgcXVvdGF0aW9uIG1hcmtcbiAgICAgIGVzY2FwZVJlZ0V4cCh0YXJnZXQubmFtZSkgKyAvLyB0YXJnZXQgbmFtZVxuICAgICAgJ1tcXCdcXFwiXScgKyAvLyBjbG9zaW5nIHF1b3RhdGlvbiBtYXJrXG4gICAgICAnLD8kJyAvLyBvcHRpb25hbCB0cmFpbGxpbmcgY29tbWFcbiAgKTtcblxuICBsZXQgbGluZUluZGV4ID0gMDtcbiAgbGluZXMuZm9yRWFjaCgobGluZSwgaSkgPT4ge1xuICAgIGlmIChyZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICBsaW5lSW5kZXggPSBpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHtwYXRoOiB0YXJnZXQucGF0aCwgbGluZTogbGluZUluZGV4LCBjb2x1bW46IDB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcHJpb3JpdHk6IDUwLFxuICBwcm92aWRlck5hbWU6ICdudWNsaWRlLWJ1Y2stZmlsZXMnLFxuICBhc3luYyBnZXRTdWdnZXN0aW9uKHRleHRFZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBQb2ludCk6IFByb21pc2U8bWl4ZWQ+IHtcbiAgICBjb25zdCBhYnNvbHV0ZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIWFic29sdXRlUGF0aCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCFpc0J1Y2tGaWxlKGFic29sdXRlUGF0aCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0ID0gYXdhaXQgYnVja1Byb2plY3RSb290Rm9yUGF0aChhYnNvbHV0ZVBhdGgpO1xuICAgIGlmICghYnVja1Byb2plY3QpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHdvcmRNYXRjaEFuZFJhbmdlID0gZXh0cmFjdFdvcmRBdFBvc2l0aW9uKHRleHRFZGl0b3IsIHBvc2l0aW9uLCB0YXJnZXRSZWdleCk7XG4gICAgaWYgKCF3b3JkTWF0Y2hBbmRSYW5nZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHt3b3JkTWF0Y2gsIHJhbmdlfSA9IHdvcmRNYXRjaEFuZFJhbmdlO1xuXG4gICAgY29uc3QgdGFyZ2V0ID0gYXdhaXQgcGFyc2VUYXJnZXQod29yZE1hdGNoLCBhYnNvbHV0ZVBhdGgsIGJ1Y2tQcm9qZWN0KTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGxvY2F0aW9uID0gYXdhaXQgZmluZFRhcmdldExvY2F0aW9uKHRhcmdldCk7XG4gICAgaWYgKGxvY2F0aW9uKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByYW5nZSxcbiAgICAgICAgY2FsbGJhY2soKSB7IGdvVG9Mb2NhdGlvbihsb2NhdGlvbi5wYXRoLCBsb2NhdGlvbi5saW5lLCBsb2NhdGlvbi5jb2x1bW4pOyB9LFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9LFxuICBwYXJzZVRhcmdldCxcbiAgZmluZFRhcmdldExvY2F0aW9uLFxufTtcbiJdfQ==