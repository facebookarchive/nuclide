

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