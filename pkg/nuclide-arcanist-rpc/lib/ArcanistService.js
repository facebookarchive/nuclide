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
exports.__TEST__ = exports.findDiagnostics = exports.getProjectRelativePath = exports.findArcProjectIdOfPath = exports.readArcConfig = exports.findArcConfigDirectory = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

let findArcConfigDirectory = exports.findArcConfigDirectory = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileName) {
    if (!arcConfigDirectoryMap.has(fileName)) {
      const result = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(ARC_CONFIG_FILE_NAME, fileName);
      arcConfigDirectoryMap.set(fileName, result);
    }
    return arcConfigDirectoryMap.get(fileName);
  });

  return function findArcConfigDirectory(_x) {
    return _ref.apply(this, arguments);
  };
})();

let readArcConfig = exports.readArcConfig = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (fileName) {
    const arcConfigDirectory = yield findArcConfigDirectory(fileName);
    if (!arcConfigDirectory) {
      return null;
    }
    if (!arcProjectMap.has(arcConfigDirectory)) {
      const arcconfigFile = (_nuclideUri || _load_nuclideUri()).default.join(arcConfigDirectory, ARC_CONFIG_FILE_NAME);
      const contents = yield (_fsPromise || _load_fsPromise()).default.readFile(arcconfigFile, 'utf8');

      if (!(typeof contents === 'string')) {
        throw new Error('Invariant violation: "typeof contents === \'string\'"');
      }

      const result = JSON.parse(contents);
      arcProjectMap.set(arcConfigDirectory, result);
    }
    return arcProjectMap.get(arcConfigDirectory);
  });

  return function readArcConfig(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let findArcProjectIdOfPath = exports.findArcProjectIdOfPath = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (fileName) {
    const project = yield readArcConfig(fileName);
    return project ? project.project_id : null;
  });

  return function findArcProjectIdOfPath(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

let getProjectRelativePath = exports.getProjectRelativePath = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (fileName) {
    const arcPath = yield findArcConfigDirectory(fileName);
    return arcPath && fileName ? (_nuclideUri || _load_nuclideUri()).default.relative(arcPath, fileName) : null;
  });

  return function getProjectRelativePath(_x4) {
    return _ref4.apply(this, arguments);
  };
})();

let findDiagnostics = exports.findDiagnostics = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (pathToFiles, skip) {
    const arcConfigDirToFiles = new Map();
    yield Promise.all(pathToFiles.map((() => {
      var _ref6 = (0, _asyncToGenerator.default)(function* (file) {
        const arcConfigDir = yield findArcConfigDirectory(file);
        if (arcConfigDir) {
          let files = arcConfigDirToFiles.get(arcConfigDir);
          if (files == null) {
            files = [];
            arcConfigDirToFiles.set(arcConfigDir, files);
          }
          files.push(file);
        }
      });

      return function (_x7) {
        return _ref6.apply(this, arguments);
      };
    })()));

    // Kick off all the arc execs at once, then await later so they all happen in parallel.
    const results = [];
    for (const _ref7 of arcConfigDirToFiles) {
      var _ref8 = _slicedToArray(_ref7, 2);

      const arcDir = _ref8[0];
      const files = _ref8[1];

      results.push(execArcLint(arcDir, files, skip));
    }

    // Flatten the resulting array
    return [].concat(...(yield Promise.all(results)));
  });

  return function findDiagnostics(_x5, _x6) {
    return _ref5.apply(this, arguments);
  };
})();

let getMercurialHeadCommitChanges = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (filePath) {
    const hgRepoDetails = (0, (_nuclideSourceControlHelpers || _load_nuclideSourceControlHelpers()).findHgRepository)(filePath);
    if (hgRepoDetails == null) {
      return null;
    }
    const filesChanged = yield (0, (_hgRevisionStateHelpers || _load_hgRevisionStateHelpers()).fetchFilesChangedAtRevision)((0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForRevisionsBeforeHead)(0), hgRepoDetails.workingDirectoryPath).refCount().toPromise();
    if (filesChanged == null) {
      throw new Error('Failed to fetch commit changed files while diffing');
    }
    return filesChanged;
  });

  return function getMercurialHeadCommitChanges(_x8) {
    return _ref9.apply(this, arguments);
  };
})();

let getCommitBasedArcConfigDirectory = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (filePath) {
    // TODO Support other source control types file changes (e.g. `git`).
    const filesChanged = yield getMercurialHeadCommitChanges(filePath);
    if (filesChanged == null) {
      throw new Error('Cannot find source control root to diff from');
    }
    let configLookupPath = null;
    if (filesChanged.all.length > 0) {
      configLookupPath = (_fsPromise || _load_fsPromise()).default.getCommonAncestorDirectory(filesChanged.all);
    } else {
      configLookupPath = filePath;
    }
    return yield findArcConfigDirectory(configLookupPath);
  });

  return function getCommitBasedArcConfigDirectory(_x9) {
    return _ref10.apply(this, arguments);
  };
})();

let execArcLint = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* (cwd, filePaths, skip) {
    const args = ['lint', '--output', 'json', ...filePaths];
    if (skip.length > 0) {
      args.push('--skip', skip.join(','));
    }
    const result = yield (0, (_nice || _load_nice()).niceCheckOutput)('arc', args, getArcExecOptions(cwd));

    const output = new Map();
    // Arc lint outputs multiple JSON objects on mutliple lines. Split them, then merge the
    // results.
    for (const line of result.stdout.trim().split('\n')) {
      let json;
      try {
        json = JSON.parse(line);
      } catch (error) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn('Error parsing `arc lint` JSON output', line);
        continue;
      }
      for (const file of Object.keys(json)) {
        const errorsToAdd = json[file];

        let errors = output.get(file);
        if (errors == null) {
          errors = [];
          output.set(file, errors);
        }
        for (const error of errorsToAdd) {
          errors.push(error);
        }
      }
    }

    const lints = [];
    for (const file of filePaths) {
      // TODO(7876450): For some reason, this does not work for particular values of pathToFile.
      // Depending on the location of .arcconfig, we may get a key that is different from what `arc
      // lint` actually returns, and end up without any lints for this path.
      const key = (_nuclideUri || _load_nuclideUri()).default.relative(cwd, file);
      const rawLints = output.get(key);
      if (rawLints) {
        for (const lint of convertLints(file, rawLints)) {
          lints.push(lint);
        }
      }
    }
    return lints;
  });

  return function execArcLint(_x11, _x12, _x13) {
    return _ref11.apply(this, arguments);
  };
})();

exports.createPhabricatorRevision = createPhabricatorRevision;
exports.updatePhabricatorRevision = updatePhabricatorRevision;
exports.execArcPull = execArcPull;
exports.execArcLand = execArcLand;
exports.execArcPatch = execArcPatch;

var _hgUtils;

function _load_hgUtils() {
  return _hgUtils = require('../../nuclide-hg-rpc/lib/hg-utils');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _nice;

function _load_nice() {
  return _nice = require('../../commons-node/nice');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _hgRevisionStateHelpers;

function _load_hgRevisionStateHelpers() {
  return _hgRevisionStateHelpers = require('../../nuclide-hg-rpc/lib/hg-revision-state-helpers');
}

var _hgRevisionExpressionHelpers;

function _load_hgRevisionExpressionHelpers() {
  return _hgRevisionExpressionHelpers = require('../../nuclide-hg-rpc/lib/hg-revision-expression-helpers');
}

var _nuclideSourceControlHelpers;

function _load_nuclideSourceControlHelpers() {
  return _nuclideSourceControlHelpers = require('../../nuclide-source-control-helpers');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ARC_CONFIG_FILE_NAME = '.arcconfig';

const arcConfigDirectoryMap = new Map();
const arcProjectMap = new Map();

function getArcExecOptions(cwd, hgEditor) {
  const options = {
    cwd: cwd,
    env: Object.assign({}, (0, (_process || _load_process()).getOriginalEnvironment)(), {
      ATOM_BACKUP_EDITOR: 'false'
    })
  };

  if (hgEditor != null) {
    options.env.HGEDITOR = hgEditor;
  }

  return options;
}

function _callArcDiff(filePath, extraArcDiffArgs) {
  const args = ['diff', '--json'].concat(extraArcDiffArgs);

  return _rxjsBundlesRxMinJs.Observable.fromPromise(getCommitBasedArcConfigDirectory(filePath)).flatMap(arcConfigDir => {
    if (arcConfigDir == null) {
      throw new Error('Failed to find Arcanist config.  Is this project set up for Arcanist?');
    }
    return (0, (_process || _load_process()).scriptSafeSpawnAndObserveOutput)('arc', args, getArcExecOptions(arcConfigDir));
  }).share();
}

function getArcDiffParams(lintExcuse) {
  let isPrepareMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  const args = [];
  if (isPrepareMode) {
    args.push('--prepare');
  }

  if (lintExcuse != null) {
    args.push('--nolint', '--excuse', lintExcuse);
  }

  return args;
}

function createPhabricatorRevision(filePath, isPrepareMode, lintExcuse) {
  const args = ['--verbatim', ...getArcDiffParams(lintExcuse, isPrepareMode)];
  return _callArcDiff(filePath, args).publish();
}

function updatePhabricatorRevision(filePath, message, allowUntracked, lintExcuse) {
  const args = ['-m', message, ...getArcDiffParams(lintExcuse)];
  if (allowUntracked) {
    args.push('--allow-untracked');
  }
  return _callArcDiff(filePath, args).publish();
}

function execArcPull(cwd, fetchLatest, allowDirtyChanges) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_hgUtils || _load_hgUtils()).getEditMergeConfigs)()).switchMap(editMergeConfigs => {
    const args = ['pull'];
    if (fetchLatest) {
      args.push('--latest');
    }

    if (allowDirtyChanges) {
      args.push('--allow-dirty');
    }

    return (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)('arc', args, getArcExecOptions(cwd, editMergeConfigs.hgEditor)));
  }).publish();
}

function execArcLand(cwd) {
  const args = ['land'];
  return (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)('arc', args, getArcExecOptions(cwd))).publish();
}

function execArcPatch(cwd, differentialRevision) {
  const args = ['patch', differentialRevision];
  return (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)('arc', args, getArcExecOptions(cwd))).publish();
}

function convertLints(pathToFile, lints) {
  return lints.map(lint => {
    // Choose an appropriate level based on lint['severity'].
    const severity = lint.severity;
    const level = severity === 'error' ? 'Error' : 'Warning';

    const line = lint.line;
    // Sometimes the linter puts in global errors on line 0, which will result
    // in a negative index. We offset those back to the first line.
    const col = Math.max(0, lint.char - 1);
    const row = Math.max(0, line - 1);

    const diagnostic = {
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

const __TEST__ = exports.__TEST__ = {
  arcConfigDirectoryMap: arcConfigDirectoryMap,
  arcProjectMap: arcProjectMap,
  reset: function () {
    arcConfigDirectoryMap.clear();
    arcProjectMap.clear();
  }
};