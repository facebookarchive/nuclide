'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Simultaneously looks at directories between `startDir` and `stopDir` (or root dir),
 * passing them to the provided `matcher` function and returning the string returned
 * by the logically first (nearest) matcher, or `null` if no matchers matched.
 * @param matcher: a function that returns the matched path if a match is found; otherwise null
 * @param startDir: Where to begin the search
 * @param stopDir: Where to stop the search (e.g., repository root), or null for filesystem root
 * @return the nearest matched path to startDir if a match is found; otherwise null
 */
let findNearest = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (matcher, startDir, stopDir) {
    const candidates = [];
    let candidateDir = startDir;
    while (candidateDir !== stopDir) {
      candidates.push(candidateDir);
      const parentDir = (_nuclideUri || _load_nuclideUri()).default.dirname(candidateDir);
      if (parentDir === candidateDir) {
        // filesystem root reached
        break;
      } else {
        candidateDir = parentDir;
      }
    }
    const results = yield Promise.all(candidates.map(matcher));
    for (const result of results) {
      if (result != null) {
        return result;
      }
    }
    return null;
  });

  return function findNearest(_x3, _x4, _x5) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * @return whether path corresponds to an ordinary file.
 */


let isFile = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (path) {
    const stats = yield stat(path);
    return stats != null && stats.isFile();
  });

  return function isFile(_x6) {
    return _ref4.apply(this, arguments);
  };
})();

/**
 * async version of https://nodejs.org/api/fs.html#fs_fs_stat_path_callback.
 * @return null if there is no such file or directory for path; otherwise, fs.Stats for path.
 */


let stat = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (path) {
    try {
      const [stats] = yield toPromise(_fs.default.stat)(path);
      return stats;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  });

  return function stat(_x7) {
    return _ref5.apply(this, arguments);
  };
})();

/**
 * async version of https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback.
 */


/**
 * async version of https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback.
 */
let readFile = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (file, options = {}) {
    const [data] = yield toPromise(_fs.default.readFile)(file, options);
    return data;
  });

  return function readFile(_x8) {
    return _ref6.apply(this, arguments);
  };
})();

let readFileAsString = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (file, encoding = 'utf8') {
    const out = yield readFile(file, { encoding });

    if (!(typeof out === 'string')) {
      throw new Error('Invariant violation: "typeof out === \'string\'"');
    }

    return out;
  });

  return function readFileAsString(_x9) {
    return _ref7.apply(this, arguments);
  };
})();

let readFileAsBuffer = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (file) {
    const out = yield readFile(file);

    if (!(out instanceof Buffer)) {
      throw new Error('Invariant violation: "out instanceof Buffer"');
    }

    return out;
  });

  return function readFileAsBuffer(_x10) {
    return _ref8.apply(this, arguments);
  };
})();

/**
 * async version of https://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback.
 * @param path directory to create.
 * @param mode defaults to 0o777.
 */


/**
 * async version of rimraf https://github.com/isaacs/rimraf#api
 * removed the path recursively
 * @param path directory or file to delete
 * @param options
 */
let remove = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (path, options = {}) {
    yield toPromise((_rimraf || _load_rimraf()).default)(path, options);
  });

  return function remove(_x11) {
    return _ref9.apply(this, arguments);
  };
})();

/**
 * Transforms any function that accepts callback as last parameter into
 * a function that returns a Promise.
 *
 * We are assuming that the callback will have a form of (error, ...results) - the node style..
 * The returned promise resolves with an array of results or rejects with an error.
 *
 * It's important to wrap the functions obtained this way with our own library
 * like we do in `commons/fs.js` to proprly type it and surface a better API if possible.
 *
 * One could argue that repeating the Promise code each time would be a bit more performant
 * but I think the code readability and brevity is more important for now. We can always
 * optimize idividual functions when we see a bottleneck.
 */


var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _rimraf;

function _load_rimraf() {
  return _rimraf = _interopRequireDefault(require('rimraf'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Searches upward through the filesystem from startDir to find a file with the
 * given name.
 * @param fileName The name of the file to find
 * @param startDir Where to begin the search (e.g., cwd)
 * @param stopDir (optional) Directory where we stop the search
 * @return path to the nearest file, or null if none exists
 */
function findNearestFile(fileName, startDir, stopDir = null) {
  const matcher = (() => {
    var _ref = (0, _asyncToGenerator.default)(function* (path) {
      const candidate = (_nuclideUri || _load_nuclideUri()).default.join(path, fileName);
      const result = yield isFile(candidate);
      return result ? candidate : null;
    });

    return function matcher(_x) {
      return _ref.apply(this, arguments);
    };
  })();
  return findNearest(matcher, startDir, stopDir);
}

/**
 * Searches upward through the filesystem from pathToDirectory to find a
 * directory with the given name.
 * @param dirName The name of the directory to find
 * @param startDir Where to begin the search (e.g., cwd)
 * @param stopDir (optional) Directory where we stop the search
 * @return path to the nearest directory, or null if none exists
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

function findNearestDir(dirName, startDir, stopDir = null) {
  const matcher = (() => {
    var _ref2 = (0, _asyncToGenerator.default)(function* (path) {
      const candidate = (_nuclideUri || _load_nuclideUri()).default.join(path, dirName);
      const stats = yield stat(candidate);
      return stats && stats.isDirectory() ? candidate : null;
    });

    return function matcher(_x2) {
      return _ref2.apply(this, arguments);
    };
  })();
  return findNearest(matcher, startDir, stopDir);
}function writeFile(file, data, options) {
  return toPromise(_fs.default.writeFile)(file, data, options);
}function mkdir(path, mode) {
  return toPromise(_fs.default.mkdir)(path, mode);
}

/**
 * @param prefix six random characters will be added to the end of this prefix.
 * @param options can be a string specifying an encoding or an object with an `encoding` property.
 */
function mkdtemp(prefix, options) {
  return toPromise(_fs.default.mkdtemp)(prefix, options).then(([tempDir]) => tempDir);
}

/**
 * async version of https://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback.
 * @param path directory to remove.
 */
function rmdir(path) {
  return toPromise(_fs.default.rmdir)(path);
}

/**
 * async version of https://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback.
 * @param path file to remove.
 */
function unlink(path) {
  return toPromise(_fs.default.unlink)(path);
}

function toPromise(func) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      args.push((err, ...results) => {
        if (err != null) {
          return reject(err);
        }
        resolve(results);
      });
      func(...args);
    });
  };
}

exports.default = {
  findNearestDir,
  findNearestFile,
  isFile,
  mkdir,
  mkdtemp,
  readFileAsBuffer,
  readFileAsString,
  remove,
  rmdir,
  stat,
  unlink,
  writeFile
};