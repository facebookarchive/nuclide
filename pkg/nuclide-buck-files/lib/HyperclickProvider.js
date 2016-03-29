

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

var _require = require('../../nuclide-buck-base');

var isBuckFile = _require.isBuckFile;

var _require2 = require('../../nuclide-buck-commons');

var buckProjectRootForPath = _require2.buckProjectRootForPath;

var _require3 = require('../../nuclide-commons');

var fsPromise = _require3.fsPromise;

var _require4 = require('../../nuclide-atom-helpers');

var goToLocation = _require4.goToLocation;
var extractWordAtPosition = _require4.extractWordAtPosition;

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
//# sourceMappingURL=data:application/json;base64,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QUM1RSxDQUFDO0tBQ0gsTUFBTTtBQUNMLGFBQU8sSUFBSSxDQUFDO0tBQ2I7R0FDRixDQUFBO0FBQ0QsYUFBVyxFQUFYLFdBQVc7QUFDWCxvQkFBa0IsRUFBbEIsa0JBQWtCO0NBQ25CLENBQUMiLCJmaWxlIjoiSHlwZXJjbGlja1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxudHlwZSBUYXJnZXQgPSB7cGF0aDogc3RyaW5nOyBuYW1lOiBzdHJpbmd9O1xuXG5pbXBvcnQgdHlwZSB7QnVja1Byb2plY3R9IGZyb20gJy4uLy4uL251Y2xpZGUtYnVjay1iYXNlL2xpYi9CdWNrUHJvamVjdCc7XG5cbmNvbnN0IHtpc0J1Y2tGaWxlfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtYnVjay1iYXNlJyk7XG5jb25zdCB7YnVja1Byb2plY3RSb290Rm9yUGF0aH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWJ1Y2stY29tbW9ucycpO1xuY29uc3Qge2ZzUHJvbWlzZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcbmNvbnN0IHtnb1RvTG9jYXRpb24sIGV4dHJhY3RXb3JkQXRQb3NpdGlvbn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycycpO1xuXG5pbXBvcnQgdHlwZSB7UG9pbnR9IGZyb20gJ2F0b20nO1xuXG5jb25zdCB0YXJnZXRSZWdleCA9IC8oXFwvKD86XFwvW1xcd1xcLVxcLl0qKSopezAsMX06KFtcXHdcXC1cXC5dKykvO1xuXG5jb25zdCBFU0NBUEVfUkVHRVhQID0gLyhbLiorP14ke30oKXxcXFtcXF1cXC9cXFxcXSkvZztcblxuZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKEVTQ0FQRV9SRUdFWFAsICdcXFxcJDEnKTtcbn1cblxuLyoqXG4gKiBUYWtlcyB0YXJnZXQgcmVnZXggbWF0Y2ggYW5kIGZpbGUgcGF0aCB3aGVyZSBnaXZlbiB0YXJnZXQgaXMgZm91bmQgYXNcbiAqIGFyZ3VtZW50cy5cbiAqIFJldHVybnMgdGFyZ2V0IGFzIG9iamVjdCB3aXRoIHBhdGggYW5kIG5hbWUgcHJvcGVydGllcy5cbiAqIEZvciBleGFtcGxlLCBpbnB1dCBtYXRjaFxuICogWycvL0FwcHMvTXlBcHA6TXlUYXJnZXQnLCAnLy9BcHBzL015QXBwJywgJ015VGFyZ2V0J10gd291bGQgYmUgcGFyc2VkIHRvXG4gKiB7cGF0aDogLy9BcHBzL015QXBwL0JVQ0ssIG5hbWU6IE15VGFyZ2V0fSBhbmQgJzpNeVRhcmdldCcgd291bGQgYmVcbiAqIHBhcnNlZCB0byB7cGF0aDogZmlsZVBhdGgsIG5hbWU6IE15VGFyZ2V0fS5cbiAqIFJldHVybnMgbnVsbCBpZiB0YXJnZXQgY2Fubm90IGJlIHBhcnNlZCBmcm9tIGdpdmVuIGFyZ3VtZW50cy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcGFyc2VUYXJnZXQoXG4gIG1hdGNoOiBBcnJheTw/c3RyaW5nPixcbiAgZmlsZVBhdGg6ID9zdHJpbmcsXG4gIGJ1Y2tQcm9qZWN0OiBCdWNrUHJvamVjdCxcbik6IFByb21pc2U8P1RhcmdldD4ge1xuICBpZiAoIW1hdGNoIHx8ICFmaWxlUGF0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgbGV0IHBhdGg7XG4gIGNvbnN0IGZ1bGxUYXJnZXQgPSBtYXRjaFsxXTtcbiAgaWYgKGZ1bGxUYXJnZXQpIHtcbiAgICAvLyBTdHJpcCBvZmYgdGhlIGxlYWRpbmcgc2xhc2hlcyBmcm9tIHRoZSBmdWxseS1xdWFsaWZpZWQgYnVpbGQgdGFyZ2V0LlxuICAgIGNvbnN0IGJhc2VQYXRoID0gZnVsbFRhcmdldC5zdWJzdHJpbmcoJy8vJy5sZW5ndGgpO1xuICAgIGNvbnN0IGJ1Y2tSb290ID0gYXdhaXQgYnVja1Byb2plY3QuZ2V0UGF0aCgpO1xuICAgIHBhdGggPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknKS5qb2luKGJ1Y2tSb290LCBiYXNlUGF0aCwgJ0JVQ0snKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBmaWxlUGF0aCBpcyBhbHJlYWR5IGFuIGFic29sdXRlIHBhdGguXG4gICAgcGF0aCA9IGZpbGVQYXRoO1xuICB9XG4gIGNvbnN0IG5hbWUgPSBtYXRjaFsyXTtcbiAgaWYgKCFuYW1lKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIHtwYXRoLCBuYW1lfTtcbn1cblxuLyoqXG4gKiBUYWtlcyBhIHRhcmdldCBhcyBhbiBhcmd1bWVudC5cbiAqIFJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSB0YXJnZXQgbG9jYXRpb24uXG4gKiBJZiB0aGUgZXhhY3QgcG9zaXRpb24gdGhlIHRhcmdldCBpbiB0aGUgZmlsZSBjYW5ub3QgYmUgZGV0ZXJtaW5lZFxuICogcG9zaXRpb24gcHJvcGVydHkgb2YgdGhlIHRhcmdldCBsb2NhdGlvbiB3aWxsIGJlIHNldCB0byBudWxsLlxuICogSWYgYHRhcmdldC5wYXRoYCBmaWxlIGNhbm5vdCBiZSBmb3VuZCBvciByZWFkLCBQcm9taXNlIHJlc29sdmVzIHRvIG51bGwuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZpbmRUYXJnZXRMb2NhdGlvbih0YXJnZXQ6IFRhcmdldCk6IFByb21pc2Uge1xuICBsZXQgZGF0YTtcbiAgdHJ5IHtcbiAgICBkYXRhID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKHRhcmdldC5wYXRoLCAndXRmLTgnKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gV2Ugc3BsaXQgdGhlIGZpbGUgY29udGVudCBpbnRvIGxpbmVzIGFuZCBsb29rIGZvciB0aGUgbGluZSB0aGF0IGxvb2tzXG4gIC8vIGxpa2UgXCJuYW1lID0gJyN7dGFyZ2V0Lm5hbWV9J1wiIGlnbm9yaW5nIHdoaXRlc3BhY2VzIGFuZCB0cmFpbGxpbmdcbiAgLy8gY29tbWEuXG4gIGNvbnN0IGxpbmVzID0gZGF0YS5zcGxpdCgnXFxuJyk7XG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgICAgICdeXFxcXHMqJyArIC8vIGJlZ2lubmluZyBvZiB0aGUgbGluZVxuICAgICAgJ25hbWVcXFxccyo9XFxcXHMqJyArIC8vIG5hbWUgPVxuICAgICAgJ1tcXCdcXFwiXScgKyAvLyBvcGVuaW5nIHF1b3RhdGlvbiBtYXJrXG4gICAgICBlc2NhcGVSZWdFeHAodGFyZ2V0Lm5hbWUpICsgLy8gdGFyZ2V0IG5hbWVcbiAgICAgICdbXFwnXFxcIl0nICsgLy8gY2xvc2luZyBxdW90YXRpb24gbWFya1xuICAgICAgJyw/JCcgLy8gb3B0aW9uYWwgdHJhaWxsaW5nIGNvbW1hXG4gICk7XG5cbiAgbGV0IGxpbmVJbmRleCA9IDA7XG4gIGxpbmVzLmZvckVhY2goKGxpbmUsIGkpID0+IHtcbiAgICBpZiAocmVnZXgudGVzdChsaW5lKSkge1xuICAgICAgbGluZUluZGV4ID0gaTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB7cGF0aDogdGFyZ2V0LnBhdGgsIGxpbmU6IGxpbmVJbmRleCwgY29sdW1uOiAwfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHByaW9yaXR5OiAyMDAsXG4gIHByb3ZpZGVyTmFtZTogJ251Y2xpZGUtYnVjay1maWxlcycsXG4gIGFzeW5jIGdldFN1Z2dlc3Rpb24odGV4dEVkaXRvcjogVGV4dEVkaXRvciwgcG9zaXRpb246IFBvaW50KTogUHJvbWlzZTxtaXhlZD4ge1xuICAgIGNvbnN0IGFic29sdXRlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghYWJzb2x1dGVQYXRoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIWlzQnVja0ZpbGUoYWJzb2x1dGVQYXRoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgYnVja1Byb2plY3QgPSBhd2FpdCBidWNrUHJvamVjdFJvb3RGb3JQYXRoKGFic29sdXRlUGF0aCk7XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgd29yZE1hdGNoQW5kUmFuZ2UgPSBleHRyYWN0V29yZEF0UG9zaXRpb24odGV4dEVkaXRvciwgcG9zaXRpb24sIHRhcmdldFJlZ2V4KTtcbiAgICBpZiAoIXdvcmRNYXRjaEFuZFJhbmdlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qge3dvcmRNYXRjaCwgcmFuZ2V9ID0gd29yZE1hdGNoQW5kUmFuZ2U7XG5cbiAgICBjb25zdCB0YXJnZXQgPSBhd2FpdCBwYXJzZVRhcmdldCh3b3JkTWF0Y2gsIGFic29sdXRlUGF0aCwgYnVja1Byb2plY3QpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbG9jYXRpb24gPSBhd2FpdCBmaW5kVGFyZ2V0TG9jYXRpb24odGFyZ2V0KTtcbiAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlLFxuICAgICAgICBjYWxsYmFjaygpIHsgZ29Ub0xvY2F0aW9uKGxvY2F0aW9uLnBhdGgsIGxvY2F0aW9uLmxpbmUsIGxvY2F0aW9uLmNvbHVtbik7IH0sXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0sXG4gIHBhcnNlVGFyZ2V0LFxuICBmaW5kVGFyZ2V0TG9jYXRpb24sXG59O1xuIl19