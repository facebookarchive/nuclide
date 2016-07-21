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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var findArcConfigDirectory = _asyncToGenerator(function* (fileName) {
  if (!arcConfigDirectoryMap.has(fileName)) {
    var result = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile(ARC_CONFIG_FILE_NAME, fileName);
    arcConfigDirectoryMap.set(fileName, result);
  }
  return arcConfigDirectoryMap.get(fileName);
});

exports.findArcConfigDirectory = findArcConfigDirectory;

var readArcConfig = _asyncToGenerator(function* (fileName) {
  var arcConfigDirectory = yield findArcConfigDirectory(fileName);
  if (!arcConfigDirectory) {
    return null;
  }
  if (!arcProjectMap.has(arcConfigDirectory)) {
    var arcconfigFile = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(arcConfigDirectory, ARC_CONFIG_FILE_NAME);
    var contents = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.readFile(arcconfigFile, 'utf8');
    (0, (_assert2 || _assert()).default)(typeof contents === 'string');
    var result = JSON.parse(contents);
    arcProjectMap.set(arcConfigDirectory, result);
  }
  return arcProjectMap.get(arcConfigDirectory);
});

exports.readArcConfig = readArcConfig;

var findArcProjectIdOfPath = _asyncToGenerator(function* (fileName) {
  var project = yield readArcConfig(fileName);
  return project ? project.project_id : null;
});

exports.findArcProjectIdOfPath = findArcProjectIdOfPath;

var getProjectRelativePath = _asyncToGenerator(function* (fileName) {
  var arcPath = yield findArcConfigDirectory(fileName);
  return arcPath && fileName ? (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.relative(arcPath, fileName) : null;
});

exports.getProjectRelativePath = getProjectRelativePath;

var findDiagnostics = _asyncToGenerator(function* (pathToFiles, skip) {
  var _ref4;

  var arcConfigDirToFiles = new Map();
  yield Promise.all(pathToFiles.map(_asyncToGenerator(function* (file) {
    var arcConfigDir = yield findArcConfigDirectory(file);
    if (arcConfigDir) {
      var files = arcConfigDirToFiles.get(arcConfigDir);
      if (files == null) {
        files = [];
        arcConfigDirToFiles.set(arcConfigDir, files);
      }
      files.push(file);
    }
  })));

  // Kick off all the arc execs at once, then await later so they all happen in parallel.
  var results = [];
  for (var _ref3 of arcConfigDirToFiles) {
    var _ref2 = _slicedToArray(_ref3, 2);

    var arcDir = _ref2[0];
    var files = _ref2[1];

    results.push(execArcLint(arcDir, files, skip));
  }

  // Flatten the resulting array
  return (_ref4 = []).concat.apply(_ref4, _toConsumableArray((yield Promise.all(results))));
});

exports.findDiagnostics = findDiagnostics;

var getMercurialHeadCommitChanges = _asyncToGenerator(function* (filePath) {
  var hgRepoDetails = (0, (_nuclideSourceControlHelpers2 || _nuclideSourceControlHelpers()).findHgRepository)(filePath);
  if (hgRepoDetails == null) {
    return null;
  }
  var filesChanged = yield (0, (_nuclideHgRepositoryBaseLibHgRevisionStateHelpers2 || _nuclideHgRepositoryBaseLibHgRevisionStateHelpers()).fetchFilesChangedAtRevision)((0, (_nuclideHgRepositoryBaseLibHgRevisionExpressionHelpers2 || _nuclideHgRepositoryBaseLibHgRevisionExpressionHelpers()).expressionForRevisionsBeforeHead)(0), hgRepoDetails.workingDirectoryPath);
  if (filesChanged == null) {
    throw new Error('Failed to fetch commit changed files while diffing');
  }
  return filesChanged;
});

var getCommitBasedArcConfigDirectory = _asyncToGenerator(function* (filePath) {
  // TODO Support other source control types file changes (e.g. `git`).
  var filesChanged = yield getMercurialHeadCommitChanges(filePath);
  if (filesChanged == null) {
    throw new Error('Cannot find source control root to diff from');
  }
  var configLookupPath = null;
  if (filesChanged.all.length > 0) {
    configLookupPath = (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.getCommonAncestorDirectory(filesChanged.all);
  } else {
    configLookupPath = filePath;
  }
  return yield findArcConfigDirectory(configLookupPath);
});

exports.createPhabricatorRevision = createPhabricatorRevision;
exports.updatePhabricatorRevision = updatePhabricatorRevision;

var execArcLint = _asyncToGenerator(function* (cwd, filePaths, skip) {
  var args = ['lint', '--output', 'json'].concat(filePaths);
  if (skip.length > 0) {
    args.push('--skip', skip.join(','));
  }
  var options = { cwd: cwd };
  var result = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).checkOutput)('arc', args, options);

  var output = new Map();
  // Arc lint outputs multiple JSON objects on mutliple lines. Split them, then merge the
  // results.
  for (var _line of result.stdout.trim().split('\n')) {
    var json = undefined;
    try {
      json = JSON.parse(_line);
    } catch (error) {
      logger.warn('Error parsing `arc lint` JSON output', _line);
      continue;
    }
    for (var file of Object.keys(json)) {
      var errorsToAdd = json[file];

      var errors = output.get(file);
      if (errors == null) {
        errors = [];
        output.set(file, errors);
      }
      for (var error of errorsToAdd) {
        errors.push(error);
      }
    }
  }

  var lints = [];
  for (var file of filePaths) {
    // TODO(7876450): For some reason, this does not work for particular values of pathToFile.
    // Depending on the location of .arcconfig, we may get a key that is different from what `arc
    // lint` actually returns, and end up without any lints for this path.
    var key = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.relative(cwd, file);
    var rawLints = output.get(key);
    if (rawLints) {
      for (var lint of convertLints(file, rawLints)) {
        lints.push(lint);
      }
    }
  }
  return lints;
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideHgRepositoryBaseLibHgRevisionStateHelpers2;

function _nuclideHgRepositoryBaseLibHgRevisionStateHelpers() {
  return _nuclideHgRepositoryBaseLibHgRevisionStateHelpers2 = require('../../nuclide-hg-repository-base/lib/hg-revision-state-helpers');
}

var _nuclideHgRepositoryBaseLibHgRevisionExpressionHelpers2;

function _nuclideHgRepositoryBaseLibHgRevisionExpressionHelpers() {
  return _nuclideHgRepositoryBaseLibHgRevisionExpressionHelpers2 = require('../../nuclide-hg-repository-base/lib/hg-revision-expression-helpers');
}

var _nuclideSourceControlHelpers2;

function _nuclideSourceControlHelpers() {
  return _nuclideSourceControlHelpers2 = require('../../nuclide-source-control-helpers');
}

var logger = require('../../nuclide-logging').getLogger();

var ARC_CONFIG_FILE_NAME = '.arcconfig';

// Exported for testing
var arcConfigDirectoryMap = new Map();
exports.arcConfigDirectoryMap = arcConfigDirectoryMap;
var arcProjectMap = new Map();

function _callArcDiff(filePath, extraArcDiffArgs) {
  var args = ['diff', '--json'].concat(extraArcDiffArgs);

  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(getCommitBasedArcConfigDirectory(filePath)).flatMap(function (arcConfigDir) {
    if (arcConfigDir == null) {
      throw new Error('Failed to find Arcanist config.  Is this project set up for Arcanist?');
    }
    var options = {
      cwd: arcConfigDir
    };
    return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).scriptSafeSpawnAndObserveOutput)('arc', args, options);
  }).share();
}

function createPhabricatorRevision(filePath) {
  return _callArcDiff(filePath, ['--verbatim']);
}

function updatePhabricatorRevision(filePath, message, allowUntracked) {
  var args = ['-m', message];
  if (allowUntracked) {
    args.push('--allow-untracked');
  }
  return _callArcDiff(filePath, args);
}

function convertLints(pathToFile, lints) {
  return lints.map(function (lint) {
    // Choose an appropriate level based on lint['severity'].
    var severity = lint.severity;
    var level = severity === 'error' ? 'Error' : 'Warning';

    var line = lint.line;
    // Sometimes the linter puts in global errors on line 0, which will result
    // in a negative index. We offset those back to the first line.
    var col = Math.max(0, lint.char - 1);
    var row = Math.max(0, line - 1);

    var diagnostic = {
      type: level,
      text: lint.description,
      filePath: pathToFile,
      row: row,
      col: col,
      code: lint.code
    };
    if (lint.original != null) {
      diagnostic.original = lint.original;
    }
    if (lint.replacement != null) {
      diagnostic.replacement = lint.replacement;
    }
    return diagnostic;
  });
}

// For autofix