'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var path = require('path');
var mkdirpLib = require('mkdirp');
var rimraf = require('rimraf');

function isRoot(filePath: string): boolean {
  return path.dirname(filePath) === filePath;
}

/**
 * @return path to a temporary file. The caller is responsible for cleaning up
 *     the file.
 */
function tempfile(options: any): Promise<string> {
  return new Promise((resolve, reject) => {
    require('temp').open(options, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info.path);
      }
    });
  });
}

/**
 * Searches upwards through the filesystem from pathToFile to find a file with
 *   fileName.
 * @param fileName The name of the file to find.
 * @param pathToDirectory Where to begin the search. Must be a path to a directory, not a
 *   file.
 * @return directory that contains the nearest file or null.
 */
async function findNearestFile(fileName: string, pathToDirectory: string): Promise<?string> {
  // TODO(5586355): If this becomes a bottleneck, we should consider memoizing
  // this function. The downside would be that if someone added a closer file
  // with fileName to pathToFile (or deleted the one that was cached), then we
  // would have a bug. This would probably be pretty rare, though.
  var currentPath = path.resolve(pathToDirectory);
  do {
    var fileToFind = path.join(currentPath, fileName);
    var hasFile = await exists(fileToFind);
    if (hasFile) {
      return currentPath;
    }

    if (isRoot(currentPath)) {
      return null;
    }
    currentPath = path.dirname(currentPath);
  } while (true);
}

function exists(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.exists(filePath, resolve);
  });
}

/**
 * Runs the equivalent of `mkdir -p` with the given path.
 *
 * Like most implementations of mkdirp, if it fails, it is possible that
 * directories were created for some prefix of the given path.
 * @return true if the path was created; false if it already existed.
 */
async function mkdirp(filePath: string): Promise<boolean> {
  var isExistingDirectory = await exists(filePath);
  if (isExistingDirectory) {
    return false;
  } else {
    return new Promise((resolve, reject) => {
      mkdirpLib(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
}

/**
 * Removes directories even if they are non-empty. Does not fail if the directory doesn't exist.
 */
async function rmdir(filePath: string): Promise {
  return new Promise((resolve, reject) => {
    rimraf(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

var asyncFs = {
  exists,
  findNearestFile,
  isRoot,
  mkdirp,
  rmdir,
  tempfile,
};

[
  'lstat',
  'mkdir',
  'readdir',
  'readFile',
  'readlink',
  'realpath',
  'rename',
  'stat',
  'unlink',
  'writeFile',
].forEach((methodName) => {
  asyncFs[methodName] = function(...args) {
    var method = fs[methodName];
    return new Promise((resolve, reject) => {
      method.apply(fs, args.concat([
        (err, result) => err ? reject(err) : resolve(result)
      ]));
    });
  };
});

module.exports = asyncFs;
