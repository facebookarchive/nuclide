'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const path = require('path');
const mkdirpLib = require('mkdirp');
const rimraf = require('rimraf');

import fs from 'fs-plus';
import invariant from 'assert';
import {checkOutput} from './process';

export function isRoot(filePath: string): boolean {
  return path.dirname(filePath) === filePath;
}

/**
 * Create a temp directory with given prefix. The caller is responsible for cleaning up the
 *   drectory.
 * @param prefix optinal prefix for the temp directory name.
 * @return path to a temporary directory.
 */
export function tempdir(prefix: string = ''): Promise<string> {
  return new Promise((resolve, reject) => {
    require('temp').mkdir(prefix, (err, dirPath) => {
      if (err) {
        reject(err);
      } else {
        resolve(dirPath);
      }
    });
  });
}

/**
 * @return path to a temporary file. The caller is responsible for cleaning up
 *     the file.
 */
export function tempfile(options: any): Promise<string> {
  return new Promise((resolve, reject) => {
    require('temp').open(options, (err, info) => {
      if (err) {
        reject(err);
      } else {
        fs.close(info.fd, closeErr => {
          if (closeErr) {
            reject(closeErr);
          } else {
            resolve(info.path);
          }
        });
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
export async function findNearestFile(fileName: string, pathToDirectory: string): Promise<?string> {
  // TODO(5586355): If this becomes a bottleneck, we should consider memoizing
  // this function. The downside would be that if someone added a closer file
  // with fileName to pathToFile (or deleted the one that was cached), then we
  // would have a bug. This would probably be pretty rare, though.
  let currentPath = path.resolve(pathToDirectory);
  do { // eslint-disable-line no-constant-condition
    const fileToFind = path.join(currentPath, fileName);
    const hasFile = await exists(fileToFind); // eslint-disable-line babel/no-await-in-loop
    if (hasFile) {
      return currentPath;
    }

    if (isRoot(currentPath)) {
      return null;
    }
    currentPath = path.dirname(currentPath);
  } while (true);
}

export function getCommonAncestorDirectory(filePaths: Array<string>): string {
  let commonDirectoryPath = path.dirname(filePaths[0]);
  while (filePaths.some(filePath => !filePath.startsWith(commonDirectoryPath))) {
    commonDirectoryPath = path.dirname(commonDirectoryPath);
  }
  return commonDirectoryPath;
}


export function exists(filePath: string): Promise<boolean> {
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
export async function mkdirp(filePath: string): Promise<boolean> {
  const isExistingDirectory = await exists(filePath);
  if (isExistingDirectory) {
    return false;
  } else {
    return new Promise((resolve, reject) => {
      mkdirpLib(filePath, err => {
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
export async function rmdir(filePath: string): Promise {
  return new Promise((resolve, reject) => {
    rimraf(filePath, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function expandHomeDir(filePath: string): string {
  const {HOME} = process.env;
  let resolvedPath = null;
  if (filePath === '~') {
    invariant(HOME != null);
    resolvedPath = HOME;
  } else if (filePath.startsWith(`~${path.sep}`)) {
    resolvedPath = `${HOME}${filePath.substr(1)}`;
  } else {
    resolvedPath = filePath;
  }
  return resolvedPath;
}

/** @return true only if we are sure directoryPath is on NFS. */
export async function isNfs(entityPath: string): Promise<boolean> {
  if (process.platform === 'linux' || process.platform === 'darwin') {
    const {stdout, exitCode} = await checkOutput('stat', ['-f', '-L', '-c', '%T', entityPath]);
    if (exitCode === 0) {
      return stdout.trim() === 'nfs';
    } else {
      return false;
    }
  } else {
    // TODO Handle other platforms (windows?): t9917576.
    return false;
  }
}

/**
 * Takes a method from Node's fs module and returns a "denodeified" equivalent, i.e., an adapter
 * with the same functionality, but returns a Promise rather than taking a callback. This isn't
 * quite as efficient as Q's implementation of denodeify, but it's considerably less code.
 */
function denodeifyFsMethod(methodName: string): () => Promise {
  return function(...args): Promise {
    const method = fs[methodName];
    return new Promise((resolve, reject) => {
      method.apply(fs, args.concat([
        (err, result) => err ? reject(err) : resolve(result),
      ]));
    });
  };
}

export const copy = denodeifyFsMethod('copy');
export const chmod = denodeifyFsMethod('chmod');
export const lstat = denodeifyFsMethod('lstat');
export const mkdir = denodeifyFsMethod('mkdir');
export const readdir = denodeifyFsMethod('readdir');
export const readFile = denodeifyFsMethod('readFile');
export const readlink = denodeifyFsMethod('readlink');
export const realpath = denodeifyFsMethod('realpath');
export const rename = denodeifyFsMethod('rename');
export const stat = denodeifyFsMethod('stat');
export const symlink = denodeifyFsMethod('symlink');
export const unlink = denodeifyFsMethod('unlink');
export const writeFile = denodeifyFsMethod('writeFile');
