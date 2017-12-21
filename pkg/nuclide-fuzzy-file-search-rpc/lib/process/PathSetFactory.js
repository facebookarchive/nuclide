'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getFilesFromRepo = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (localDirectory) {
    if (!(yield (_fsPromise || _load_fsPromise()).default.exists((_nuclideUri || _load_nuclideUri()).default.join(localDirectory, '.repo')))) {
      throw new Error(`${localDirectory} is not a repo root`);
    }
    const subRoots = (yield (0, (_process || _load_process()).runCommand)('repo', ['list', '-p'], {
      cwd: localDirectory
    }).toPromise()).split(/\n/).filter(function (s) {
      return s.length > 0;
    });

    const fileLists = yield (0, (_promise || _load_promise()).asyncLimit)(subRoots, 20, function (subRoot) {
      return getFilesFromGit((_nuclideUri || _load_nuclideUri()).default.join(localDirectory, subRoot)).catch(function () {
        return [];
      }).then(function (files) {
        return files.map(function (file) {
          return (_nuclideUri || _load_nuclideUri()).default.join(subRoot, file);
        });
      });
    });

    return [].concat(...fileLists);
  });

  return function getFilesFromRepo(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.getPaths = getPaths;

var _child_process = _interopRequireDefault(require('child_process'));

var _split;

function _load_split() {
  return _split = _interopRequireDefault(require('split'));
}

var _nuclideWatchmanHelpers;

function _load_nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers = require('../../../nuclide-watchman-helpers');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getFilesFromCommand(command, args, localDirectory, transform) {
  return new Promise((resolve, reject) => {
    // Use `spawn` here to process the, possibly huge, output of the file listing.

    const proc = _child_process.default.spawn(command, args, { cwd: localDirectory });

    proc.on('error', reject);

    const filePaths = [];
    proc.stdout.pipe((0, (_split || _load_split()).default)()).on('data', filePath_ => {
      let filePath = filePath_;
      if (transform) {
        filePath = transform(filePath);
      }

      if (filePath !== '') {
        filePaths.push(filePath);
      }
    });

    let errorString = '';
    proc.stderr.on('data', data => {
      errorString += data;
    });

    proc.on('close', code => {
      if (code === 0) {
        resolve(filePaths);
      } else {
        reject(errorString);
      }
    });
  });
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function getTrackedHgFiles(localDirectory) {
  return (_fsPromise || _load_fsPromise()).default.exists((_nuclideUri || _load_nuclideUri()).default.join(localDirectory, '.hg')).then(isRoot => {
    if (isRoot) {
      return getFilesFromCommand('hg', ['locate'], localDirectory);
    } else {
      return getFilesFromCommand('hg', ['locate', '--fullpath', '--include', '.'], localDirectory, filePath => filePath.slice(localDirectory.length + 1));
    }
  });
}

/**
 * 'Untracked' files are files that haven't been added to the repo, but haven't
 * been explicitly hg-ignored.
 */
function getUntrackedHgFiles(localDirectory) {
  return getFilesFromCommand('hg',
  // Calling 'hg status' with a path has two side-effects:
  // 1. It returns the status of only files under the given path. In this case,
  //    we only want the untracked files under the given localDirectory.
  // 2. It returns the paths relative to the directory in which this command is
  //    run. This is hard-coded to 'localDirectory' in `getFilesFromCommand`,
  //    which is what we want.
  ['status', '--unknown', '--no-status' /* No status code. */
  , localDirectory], localDirectory);
}

/**
 * @param localDirectory The full path to a directory.
 * @return If localDirectory is within an Hg repo, returns an Object where the
 *   keys are file paths (relative to the 'localDirectory') of tracked and untracked
 *   files within that directory, but not including ignored files. All values
 *   are 'true'. If localDirectory is not within an Hg repo, the Promise rejects.
 */
function getFilesFromHg(localDirectory) {
  return Promise.all([getTrackedHgFiles(localDirectory),
  // It's not a dealbreaker if untracked files fail to show up.
  getUntrackedHgFiles(localDirectory).catch(() => [])]).then(returnedFiles => {
    const [trackedFiles, untrackedFiles] = returnedFiles;
    return trackedFiles.concat(untrackedFiles);
  });
}

function getTrackedGitFiles(localDirectory) {
  return getFilesFromCommand('git', ['ls-files'], localDirectory);
}

/**
 * 'Untracked' files are files that haven't been added to the repo, but haven't
 * been explicitly git-ignored.
 */
function getUntrackedGitFiles(localDirectory) {
  // '--others' means untracked files, and '--exclude-standard' excludes ignored files.
  return getFilesFromCommand('git', ['ls-files', '--exclude-standard', '--others'], localDirectory);
}

/**
 * @param localDirectory The full path to a directory.
 * @return If localDirectory is within a Git repo, returns an Object where the
 *   keys are file paths (relative to the 'localDirectory') of tracked and untracked
 *   files within that directory, but not including ignored files. All values
 *   are 'true'. If localDirectory is not within a Git repo, the Promise rejects.
 */
function getFilesFromGit(localDirectory) {
  return Promise.all([getTrackedGitFiles(localDirectory), getUntrackedGitFiles(localDirectory)]).then(returnedFiles => {
    const [trackedFiles, untrackedFiles] = returnedFiles;
    return trackedFiles.concat(untrackedFiles);
  });
}

function getAllFiles(localDirectory) {
  return getFilesFromCommand('find', ['.', '-type', 'f'], localDirectory,
  // Slice off the leading `./` that find will add on here.
  filePath => filePath.substring(2));
}

function getAllFilesFromWatchman( // eslint-disable-line no-unused-vars
localDirectory) {
  const client = new (_nuclideWatchmanHelpers || _load_nuclideWatchmanHelpers()).WatchmanClient();
  try {
    return client.listFiles(localDirectory);
  } finally {
    client.dispose();
  }
}

function getPaths(localDirectory) {
  // Attempts to get a list of files relative to `localDirectory`, hopefully from
  // a fast source control index.
  // TODO (williamsc) once ``{HG|Git}Repository` is working in nuclide-server,
  // use those instead to determine VCS.
  return getFilesFromHg(localDirectory).catch(() => getFilesFromGit(localDirectory))
  // .catch(() => getAllFilesFromWatchman(localDirectory))
  .catch(() => getFilesFromRepo(localDirectory)).catch(() => getAllFiles(localDirectory)).catch(() => {
    throw new Error(`Failed to populate FileSearch for ${localDirectory}`);
  });
}

const __test__ = exports.__test__ = {
  getFilesFromGit,
  getFilesFromHg
};