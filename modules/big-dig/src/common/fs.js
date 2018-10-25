"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _rimraf() {
  const data = _interopRequireDefault(require("rimraf"));

  _rimraf = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/**
 * Searches upward through the filesystem from startDir to find a file with the
 * given name.
 * @param fileName The name of the file to find
 * @param startDir Where to begin the search (e.g., cwd)
 * @param stopDir (optional) Directory where we stop the search
 * @return path to the nearest file, or null if none exists
 */
function findNearestFile(fileName, startDir, stopDir = null) {
  const matcher = async path => {
    const candidate = _nuclideUri().default.join(path, fileName);

    const result = await isFile(candidate);
    return result ? candidate : null;
  };

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


function findNearestDir(dirName, startDir, stopDir = null) {
  const matcher = async path => {
    const candidate = _nuclideUri().default.join(path, dirName);

    const stats = await stat(candidate);
    return stats && stats.isDirectory() ? candidate : null;
  };

  return findNearest(matcher, startDir, stopDir);
}
/**
 * Simultaneously looks at directories between `startDir` and `stopDir` (or root dir),
 * passing them to the provided `matcher` function and returning the string returned
 * by the logically first (nearest) matcher, or `null` if no matchers matched.
 * @param matcher: a function that returns the matched path if a match is found; otherwise null
 * @param startDir: Where to begin the search
 * @param stopDir: Where to stop the search (e.g., repository root), or null for filesystem root
 * @return the nearest matched path to startDir if a match is found; otherwise null
 */


async function findNearest(matcher, startDir, stopDir) {
  const candidates = [];
  let candidateDir = startDir;

  while (candidateDir !== stopDir) {
    candidates.push(candidateDir);

    const parentDir = _nuclideUri().default.dirname(candidateDir);

    if (parentDir === candidateDir) {
      // filesystem root reached
      break;
    } else {
      candidateDir = parentDir;
    }
  }

  const results = await Promise.all(candidates.map(matcher));

  for (const result of results) {
    if (result != null) {
      return result;
    }
  }

  return null;
}
/**
 * @return whether path corresponds to an ordinary file.
 */


async function isFile(path) {
  const stats = await stat(path);
  return stats != null && stats.isFile();
}
/**
 * async version of https://nodejs.org/api/fs.html#fs_fs_stat_path_callback.
 * @return null if there is no such file or directory for path; otherwise, fs.Stats for path.
 */


async function stat(path) {
  try {
    const [stats] = await toPromise(_fs.default.stat)(path);
    return stats;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}
/**
 * async version of https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback.
 */


function writeFile(file, data, options) {
  return toPromise(_fs.default.writeFile)(file, data, options);
}
/**
 * async version of https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback.
 */


async function readFile(file, options = {}) {
  const [data] = await toPromise(_fs.default.readFile)(file, options);
  return data;
}

async function readFileAsString(file, encoding = 'utf8') {
  const out = await readFile(file, {
    encoding
  });

  if (!(typeof out === 'string')) {
    throw new Error("Invariant violation: \"typeof out === 'string'\"");
  }

  return out;
}

async function readFileAsBuffer(file) {
  const out = await readFile(file);

  if (!(out instanceof Buffer)) {
    throw new Error("Invariant violation: \"out instanceof Buffer\"");
  }

  return out;
}
/**
 * async version of https://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback.
 * @param path directory to create.
 * @param mode defaults to 0o777.
 */


function mkdir(path, mode) {
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

/**
 * async version of rimraf https://github.com/isaacs/rimraf#api
 * removed the path recursively
 * @param path directory or file to delete
 * @param options
 */
async function remove(path, options = {}) {
  await toPromise(_rimraf().default)(path, options);
}
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

var _default = {
  findNearestDir,
  findNearestFile,
  isFile,
  mkdir,
  mkdtemp,
  readFileAsBuffer,
  readFileAsString,
  readFile,
  remove,
  rmdir,
  stat,
  unlink,
  writeFile
};
exports.default = _default;