var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
    data = yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.readFile(target.path, 'utf-8');
  } catch (e) {
    return null;
  }

  // We split the file content into lines and look for the line that looks
  // like "name = '#{target.name}'" ignoring whitespaces and trailling
  // comma.
  var lines = data.split('\n');
  var regex = new RegExp('^\\s*' + // beginning of the line
  'name\\s*=\\s*' + // name =
  '[\'"]' + // opening quotation mark
  (0, (_escapeStringRegexp2 || _escapeStringRegexp()).default)(target.name) + // target name
  '[\'"]' + // closing quotation mark
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

/**
 * @return HyperclickMatch if (textEditor, position) identifies a build target.
 */

var findBuildTarget = _asyncToGenerator(function* (textEditor, position, absolutePath, buckProject) {
  var wordMatchAndRange = (0, (_nuclideAtomHelpers2 || _nuclideAtomHelpers()).extractWordAtPosition)(textEditor, position, TARGET_REGEX);
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
  if (location != null) {
    return _extends({}, location, { range: range });
  } else {
    return null;
  }
});

/**
 * @return HyperclickMatch if (textEditor, position) identifies a file path that resolves to a file
 *   under the specified directory.
 */

var findRelativeFilePath = _asyncToGenerator(function* (textEditor, position, directory) {
  var wordMatchAndRange = (0, (_nuclideAtomHelpers2 || _nuclideAtomHelpers()).extractWordAtPosition)(textEditor, position, RELATIVE_FILE_PATH_REGEX);
  if (!wordMatchAndRange) {
    return null;
  }
  var wordMatch = wordMatchAndRange.wordMatch;
  var range = wordMatchAndRange.range;

  // Make sure that the quotes match up.
  if (wordMatch[1] !== wordMatch[3]) {
    return null;
  }

  var potentialPath = (_path2 || _path()).default.join(directory, wordMatch[2]);
  var stat = undefined;
  try {
    stat = yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.stat(potentialPath);
  } catch (e) {
    return null;
  }

  if (stat.isFile()) {
    return {
      path: potentialPath,
      line: 0,
      column: 0,
      range: range
    };
  } else {
    return null;
  }
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideBuckCommons2;

function _nuclideBuckCommons() {
  return _nuclideBuckCommons2 = require('../../nuclide-buck-commons');
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var _nuclideAtomHelpers2;

function _nuclideAtomHelpers() {
  return _nuclideAtomHelpers2 = require('../../nuclide-atom-helpers');
}

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var _escapeStringRegexp2;

function _escapeStringRegexp() {
  return _escapeStringRegexp2 = _interopRequireDefault(require('escape-string-regexp'));
}

var VALID_BUILD_FILE_NAMES = new Set(['BUCK', 'BUCK.autodeps', 'TARGETS']);

module.exports = {
  priority: 200,
  providerName: 'nuclide-buck',
  getSuggestion: _asyncToGenerator(function* (textEditor, position) {
    var absolutePath = textEditor.getPath();
    if (!absolutePath) {
      return null;
    }

    var baseName = (_path2 || _path()).default.basename(absolutePath);
    if (!VALID_BUILD_FILE_NAMES.has(baseName)) {
      return null;
    }

    var buckProject = yield (0, (_nuclideBuckCommons2 || _nuclideBuckCommons()).buckProjectRootForPath)(absolutePath);
    if (!buckProject) {
      return null;
    }

    var results = yield Promise.all([findBuildTarget(textEditor, position, absolutePath, buckProject), findRelativeFilePath(textEditor, position, (_path2 || _path()).default.dirname(absolutePath))]);
    var hyperclickMatch = results.find(function (x) {
      return x != null;
    });

    if (hyperclickMatch != null) {
      var _ret = (function () {
        var match = hyperclickMatch;
        return {
          v: {
            range: match.range,
            callback: function callback() {
              (0, (_nuclideAtomHelpers2 || _nuclideAtomHelpers()).goToLocation)(match.path, match.line, match.column);
            }
          }
        };
      })();

      if (typeof _ret === 'object') return _ret.v;
    } else {
      return null;
    }
  }),
  parseTarget: parseTarget,
  findTargetLocation: findTargetLocation
};

var TARGET_REGEX = /(\/(?:\/[\w\-\.]*)*){0,1}:([\w\-\.]+)/;

var RELATIVE_FILE_PATH_REGEX = /(['"])(.*)(['"])/;