'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This code implements the NuclideFs service.  It exports the FS on http via
 * the endpoint: http://your.server:your_port/fs/method where method is one of
 * readFile, writeFile, etc.
 */

var fs = require('fs');
var pathUtil = require('path');
var {fsPromise} = require('nuclide-commons');
var {deserializeArgs} = require('../utils');


///////////////////
//
// Services
//
//////////////////

/**
 * Checks a certain path for existence and returns 'true'/'false' accordingly
 */
function exists(path: string): Promise<boolean> {
  return fsPromise.exists(path);
}

function findNearestFile(fileName: string, pathToDirectory: string): Promise<?string> {
  return fsPromise.findNearestFile(fileName, pathToDirectory);
}

/**
 * The lstat endpoint is the same as the stat endpoint except it will return
 * the stat of a link instead of the file the link points to.
 */
function lstat(path: string): Promise<fs.Stats> {
  return fsPromise.lstat(path);
}

/**
 * Creates a new directory with the given path.
 * Throws EEXIST error if the directory already exists.
 * Throws ENOENT if the path given is nested in a non-existing directory.
 */
function mkdir(path: string): Promise<string> {
  return fsPromise.mkdir(path);
}

/**
 * Runs the equivalent of `mkdir -p` with the given path.
 *
 * Like most implementations of mkdirp, if it fails, it is possible that
 * directories were created for some prefix of the given path.
 * @return true if the path was created; false if it already existed.
 */
function mkdirp(path: string): Promise<boolean> {
  return fsPromise.mkdirp(path);
}

/**
 * If no file (or directory) at the specified path exists, creates the parent
 * directories (if necessary) and then writes an empty file at the specified
 * path.
 *
 * @return A boolean indicating whether the file was created.
 */
async function newFile(filePath: string): Promise<boolean> {
  var isExistingFile = await fsPromise.exists(filePath);
  if (isExistingFile) {
    return false;
  }
  await fsPromise.mkdirp(pathUtil.dirname(filePath));
  await fsPromise.writeFile(filePath, '');
  return true;
}

/**
 * The readdir endpoint accepts the following query parameters:
 *
 *   path: path to the folder to list entries inside.
 *
 * Body contains a JSON encoded array of objects with file: and stats: entries.
 * file: has the file or directory name, stats: has the stats of the file/dir,
 * isSymbolicLink: true if the entry is a symlink to another filesystem location.
 */
async function readdir(path: string): Promise<Array<FileWithStats>> {
  var files = await fsPromise.readdir(path);
  var entries = await Promise.all(files.map(async (file) => {
    var fullpath = pathUtil.join(path, file);
    var lstats = await fsPromise.lstat(fullpath);
    if (!lstats.isSymbolicLink()) {
      return {file, stats: lstats, isSymbolicLink: false};
    } else {
      try {
        var stats = await fsPromise.stat(fullpath);
        return {file, stats, isSymbolicLink: true};
      } catch (error) {
        return {file, stats: undefined, isSymbolicLink: true, error};
      }
    }
  }));
  // TODO: Return entries directly and change client to handle error.
  return entries.filter((entry) => {return entry.error === undefined});
}

/**
 * Gets the real path of a file path.
 * It could be different than the given path if the file is a symlink
 * or exists in a symlinked directory.
 */
function realpath(path: string): Promise<string> {
  return fsPromise.realpath(path);
}

/**
 * Runs the equivalent of `mv sourcePath destinationPath`.
 */
function rename(sourcePath: string, destinationPath: string): Promise {
  return new Promise((resolve, reject) => {
    // TODO(jjiaa): Use the Atom builtin version of fs-plus when it gets upgraded.
    var fsPlus = require('fs-plus');
    fsPlus.move(sourcePath, destinationPath, error => {
      error ? reject(error) : resolve();
    });
  });
}

/**
 * Removes directories even if they are non-empty. Does not fail if the directory doesn't exist.
 */
function rmdir(path: string): Promise<boolean> {
  return fsPromise.rmdir(path);
}

/**
 * The stat endpoint accepts the following query parameters:
 *
 *   path: path to the file to read (that is it must be quoted)
 *
 * It returns a JSON encoded stats object that looks something like this:
 *
 * { dev: 2114,
 *  ino: 48064969,
 *  mode: 33188,
 *  nlink: 1,
 *  uid: 85,
 *  gid: 100,
 *  rdev: 0,
 *  size: 527,
 *  blksize: 4096,
 *  blocks: 8,
 *  atime: 'Mon, 10 Oct 2011 23:24:11 GMT',
 *  mtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
 *  ctime: 'Mon, 10 Oct 2011 23:24:11 GMT',
 *  birthtime: 'Mon, 10 Oct 2011 23:24:11 GMT'
 * }
 *
 */
function stat(path: string): Promise<fs.Stats> {
  return fsPromise.stat(path);
}

/**
 * Removes files. Does not fail if the file doesn't exist.
 */
function unlink(path: string): Promise {
  return fsPromise.unlink(path).catch((error) => {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  });
}


///////////////////
//
// URL Handlers
//
//////////////////

/**
 * The readFile endpoint accepts the following query parameters:
 *
 *   path: the path to the file to read (it must be url encoded)
 *   options: JSON encoded + url encoded set of options that are passed to
 *            fs.createReadStream.
 *
 * It returns the contents of the file as binary in the body and sets
 * Content-Type to application/octet-stream.
 *
 * The readFile function takes a request and response  It has no return value.
 */
function readFile(request: http.IncomingMessage, response: http.OutgoingMessage, next: (err: Error) => void) {
  var [path, options] = deserializeArgs(request.url);

  try {
    var fileStream = fs.createReadStream(path, options);

    fileStream.on('open', (fd) => {
      response.setHeader('Content-Type', 'application/octet-stream');
      fileStream.pipe(response);
    });

    fileStream.on('error', next);
  } catch (e) {
    next(new Error(`NuclideFs.readFile for path ${path} error: ${e}`));
  }
}

/**
 * The writeFile endpoint accepts the following query parameters:
 *
 *   path: path to the file to read (it must be url encoded).
 *   options: JSON encoded + url encoded set of options that are passed to
 *            fs.createWriteStream.
 *
 * It expects the body of the request to be the binary contents you want written
 * to the file specified by the path query parameter.
 *
 * The writeFile function takes a request and response. It has no return value.
 */
function writeFile(request: http.IncomingMessage, response: http.OutgoingMessage, next: (err: Error) => void) {
  var [path, options] = deserializeArgs(request.url);

  try {
    var fileStream = fs.createWriteStream(path, options);
    fileStream.on('open', (fd) => {
      // While writing something goes wrong.
      request.pipe(fileStream).on('error', next).on('close', () => {
        response.end();
      });
    });

    // Failed to open file for writing.
    fileStream.on('error', next);
  } catch (e) {
    next(new Error(`NuclideFs.writeFile for path ${path} error: ${e}`));
  }
}


module.exports = {
  services: {
    '/fs/exists': {handler: exists},
    '/fs/findNearestFile': {handler: findNearestFile},
    '/fs/lstat': {handler: lstat},
    '/fs/mkdir': {handler: mkdir, method: 'post'},
    '/fs/mkdirp': {handler: mkdirp, method: 'post'},
    '/fs/newFile': {handler: newFile, method: 'post'},
    '/fs/readdir': {handler: readdir},
    '/fs/realpath': {handler: realpath, method: 'get', text: true},
    '/fs/rename': {handler: rename, method: 'post'},
    '/fs/rmdir': {handler: rmdir, method: 'post'},
    '/fs/stat': {handler: stat},
    '/fs/unlink': {handler: unlink, method: 'post'},
  },
  urlHandlers: {
    '/fs/readFile': {handler: readFile},
    '/fs/writeFile': {handler: writeFile, method: 'post'},
  },
};
