

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
    path = require('../../nuclide-remote-uri').join(buckRoot, basePath, 'BUCK');
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

var _require = require('../../nuclide-buck-commons');

var buckProjectRootForPath = _require.buckProjectRootForPath;

var _require2 = require('../../nuclide-commons');

var fsPromise = _require2.fsPromise;

var _require3 = require('../../nuclide-atom-helpers');

var goToLocation = _require3.goToLocation;
var extractWordAtPosition = _require3.extractWordAtPosition;

var pathModule = require('path');

var targetRegex = /(\/(?:\/[\w\-\.]*)*){0,1}:([\w\-\.]+)/;

var ESCAPE_REGEXP = /([.*+?^${}()|\[\]\/\\])/g;

function escapeRegExp(str) {
  return str.replace(ESCAPE_REGEXP, '\\$1');
}

module.exports = {
  priority: 200,
  providerName: 'nuclide-buck-files',
  getSuggestion: _asyncToGenerator(function* (textEditor, position) {
    var absolutePath = textEditor.getPath();
    if (!absolutePath) {
      return null;
    }

    var baseName = pathModule.basename(absolutePath);
    if (baseName !== 'BUCK' && baseName !== 'BUCK.autodeps') {
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
//# sourceMappingURL=data:application/json;base64,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SUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQUU7T0FDNUUsQ0FBQztLQUNILE1BQU07QUFDTCxhQUFPLElBQUksQ0FBQztLQUNiO0dBQ0YsQ0FBQTtBQUNELGFBQVcsRUFBWCxXQUFXO0FBQ1gsb0JBQWtCLEVBQWxCLGtCQUFrQjtDQUNuQixDQUFDIiwiZmlsZSI6Ikh5cGVyY2xpY2tQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnR5cGUgVGFyZ2V0ID0ge3BhdGg6IHN0cmluZzsgbmFtZTogc3RyaW5nfTtcblxuaW1wb3J0IHR5cGUge0J1Y2tQcm9qZWN0fSBmcm9tICcuLi8uLi9udWNsaWRlLWJ1Y2stYmFzZS9saWIvQnVja1Byb2plY3QnO1xuXG5jb25zdCB7YnVja1Byb2plY3RSb290Rm9yUGF0aH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWJ1Y2stY29tbW9ucycpO1xuY29uc3Qge2ZzUHJvbWlzZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcbmNvbnN0IHtnb1RvTG9jYXRpb24sIGV4dHJhY3RXb3JkQXRQb3NpdGlvbn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycycpO1xuY29uc3QgcGF0aE1vZHVsZSA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuaW1wb3J0IHR5cGUge1BvaW50fSBmcm9tICdhdG9tJztcblxuY29uc3QgdGFyZ2V0UmVnZXggPSAvKFxcLyg/OlxcL1tcXHdcXC1cXC5dKikqKXswLDF9OihbXFx3XFwtXFwuXSspLztcblxuY29uc3QgRVNDQVBFX1JFR0VYUCA9IC8oWy4qKz9eJHt9KCl8XFxbXFxdXFwvXFxcXF0pL2c7XG5cbmZ1bmN0aW9uIGVzY2FwZVJlZ0V4cChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHIucmVwbGFjZShFU0NBUEVfUkVHRVhQLCAnXFxcXCQxJyk7XG59XG5cbi8qKlxuICogVGFrZXMgdGFyZ2V0IHJlZ2V4IG1hdGNoIGFuZCBmaWxlIHBhdGggd2hlcmUgZ2l2ZW4gdGFyZ2V0IGlzIGZvdW5kIGFzXG4gKiBhcmd1bWVudHMuXG4gKiBSZXR1cm5zIHRhcmdldCBhcyBvYmplY3Qgd2l0aCBwYXRoIGFuZCBuYW1lIHByb3BlcnRpZXMuXG4gKiBGb3IgZXhhbXBsZSwgaW5wdXQgbWF0Y2hcbiAqIFsnLy9BcHBzL015QXBwOk15VGFyZ2V0JywgJy8vQXBwcy9NeUFwcCcsICdNeVRhcmdldCddIHdvdWxkIGJlIHBhcnNlZCB0b1xuICoge3BhdGg6IC8vQXBwcy9NeUFwcC9CVUNLLCBuYW1lOiBNeVRhcmdldH0gYW5kICc6TXlUYXJnZXQnIHdvdWxkIGJlXG4gKiBwYXJzZWQgdG8ge3BhdGg6IGZpbGVQYXRoLCBuYW1lOiBNeVRhcmdldH0uXG4gKiBSZXR1cm5zIG51bGwgaWYgdGFyZ2V0IGNhbm5vdCBiZSBwYXJzZWQgZnJvbSBnaXZlbiBhcmd1bWVudHMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHBhcnNlVGFyZ2V0KFxuICBtYXRjaDogQXJyYXk8P3N0cmluZz4sXG4gIGZpbGVQYXRoOiA/c3RyaW5nLFxuICBidWNrUHJvamVjdDogQnVja1Byb2plY3QsXG4pOiBQcm9taXNlPD9UYXJnZXQ+IHtcbiAgaWYgKCFtYXRjaCB8fCAhZmlsZVBhdGgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBwYXRoO1xuICBjb25zdCBmdWxsVGFyZ2V0ID0gbWF0Y2hbMV07XG4gIGlmIChmdWxsVGFyZ2V0KSB7XG4gICAgLy8gU3RyaXAgb2ZmIHRoZSBsZWFkaW5nIHNsYXNoZXMgZnJvbSB0aGUgZnVsbHktcXVhbGlmaWVkIGJ1aWxkIHRhcmdldC5cbiAgICBjb25zdCBiYXNlUGF0aCA9IGZ1bGxUYXJnZXQuc3Vic3RyaW5nKCcvLycubGVuZ3RoKTtcbiAgICBjb25zdCBidWNrUm9vdCA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmdldFBhdGgoKTtcbiAgICBwYXRoID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJykuam9pbihidWNrUm9vdCwgYmFzZVBhdGgsICdCVUNLJyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gZmlsZVBhdGggaXMgYWxyZWFkeSBhbiBhYnNvbHV0ZSBwYXRoLlxuICAgIHBhdGggPSBmaWxlUGF0aDtcbiAgfVxuICBjb25zdCBuYW1lID0gbWF0Y2hbMl07XG4gIGlmICghbmFtZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiB7cGF0aCwgbmFtZX07XG59XG5cbi8qKlxuICogVGFrZXMgYSB0YXJnZXQgYXMgYW4gYXJndW1lbnQuXG4gKiBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgdGFyZ2V0IGxvY2F0aW9uLlxuICogSWYgdGhlIGV4YWN0IHBvc2l0aW9uIHRoZSB0YXJnZXQgaW4gdGhlIGZpbGUgY2Fubm90IGJlIGRldGVybWluZWRcbiAqIHBvc2l0aW9uIHByb3BlcnR5IG9mIHRoZSB0YXJnZXQgbG9jYXRpb24gd2lsbCBiZSBzZXQgdG8gbnVsbC5cbiAqIElmIGB0YXJnZXQucGF0aGAgZmlsZSBjYW5ub3QgYmUgZm91bmQgb3IgcmVhZCwgUHJvbWlzZSByZXNvbHZlcyB0byBudWxsLlxuICovXG5hc3luYyBmdW5jdGlvbiBmaW5kVGFyZ2V0TG9jYXRpb24odGFyZ2V0OiBUYXJnZXQpOiBQcm9taXNlIHtcbiAgbGV0IGRhdGE7XG4gIHRyeSB7XG4gICAgZGF0YSA9IGF3YWl0IGZzUHJvbWlzZS5yZWFkRmlsZSh0YXJnZXQucGF0aCwgJ3V0Zi04Jyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFdlIHNwbGl0IHRoZSBmaWxlIGNvbnRlbnQgaW50byBsaW5lcyBhbmQgbG9vayBmb3IgdGhlIGxpbmUgdGhhdCBsb29rc1xuICAvLyBsaWtlIFwibmFtZSA9ICcje3RhcmdldC5uYW1lfSdcIiBpZ25vcmluZyB3aGl0ZXNwYWNlcyBhbmQgdHJhaWxsaW5nXG4gIC8vIGNvbW1hLlxuICBjb25zdCBsaW5lcyA9IGRhdGEuc3BsaXQoJ1xcbicpO1xuICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoXG4gICAgICAnXlxcXFxzKicgKyAvLyBiZWdpbm5pbmcgb2YgdGhlIGxpbmVcbiAgICAgICduYW1lXFxcXHMqPVxcXFxzKicgKyAvLyBuYW1lID1cbiAgICAgICdbXFwnXFxcIl0nICsgLy8gb3BlbmluZyBxdW90YXRpb24gbWFya1xuICAgICAgZXNjYXBlUmVnRXhwKHRhcmdldC5uYW1lKSArIC8vIHRhcmdldCBuYW1lXG4gICAgICAnW1xcJ1xcXCJdJyArIC8vIGNsb3NpbmcgcXVvdGF0aW9uIG1hcmtcbiAgICAgICcsPyQnIC8vIG9wdGlvbmFsIHRyYWlsbGluZyBjb21tYVxuICApO1xuXG4gIGxldCBsaW5lSW5kZXggPSAwO1xuICBsaW5lcy5mb3JFYWNoKChsaW5lLCBpKSA9PiB7XG4gICAgaWYgKHJlZ2V4LnRlc3QobGluZSkpIHtcbiAgICAgIGxpbmVJbmRleCA9IGk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge3BhdGg6IHRhcmdldC5wYXRoLCBsaW5lOiBsaW5lSW5kZXgsIGNvbHVtbjogMH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBwcmlvcml0eTogMjAwLFxuICBwcm92aWRlck5hbWU6ICdudWNsaWRlLWJ1Y2stZmlsZXMnLFxuICBhc3luYyBnZXRTdWdnZXN0aW9uKHRleHRFZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBQb2ludCk6IFByb21pc2U8bWl4ZWQ+IHtcbiAgICBjb25zdCBhYnNvbHV0ZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIWFic29sdXRlUGF0aCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgYmFzZU5hbWUgPSBwYXRoTW9kdWxlLmJhc2VuYW1lKGFic29sdXRlUGF0aCk7XG4gICAgaWYgKGJhc2VOYW1lICE9PSAnQlVDSycgJiYgYmFzZU5hbWUgIT09ICdCVUNLLmF1dG9kZXBzJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgYnVja1Byb2plY3QgPSBhd2FpdCBidWNrUHJvamVjdFJvb3RGb3JQYXRoKGFic29sdXRlUGF0aCk7XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgd29yZE1hdGNoQW5kUmFuZ2UgPSBleHRyYWN0V29yZEF0UG9zaXRpb24odGV4dEVkaXRvciwgcG9zaXRpb24sIHRhcmdldFJlZ2V4KTtcbiAgICBpZiAoIXdvcmRNYXRjaEFuZFJhbmdlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qge3dvcmRNYXRjaCwgcmFuZ2V9ID0gd29yZE1hdGNoQW5kUmFuZ2U7XG5cbiAgICBjb25zdCB0YXJnZXQgPSBhd2FpdCBwYXJzZVRhcmdldCh3b3JkTWF0Y2gsIGFic29sdXRlUGF0aCwgYnVja1Byb2plY3QpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbG9jYXRpb24gPSBhd2FpdCBmaW5kVGFyZ2V0TG9jYXRpb24odGFyZ2V0KTtcbiAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlLFxuICAgICAgICBjYWxsYmFjaygpIHsgZ29Ub0xvY2F0aW9uKGxvY2F0aW9uLnBhdGgsIGxvY2F0aW9uLmxpbmUsIGxvY2F0aW9uLmNvbHVtbik7IH0sXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0sXG4gIHBhcnNlVGFyZ2V0LFxuICBmaW5kVGFyZ2V0TG9jYXRpb24sXG59O1xuIl19