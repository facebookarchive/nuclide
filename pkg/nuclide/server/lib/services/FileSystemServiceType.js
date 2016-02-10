'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Stats} from 'fs';

export type FileWithStats = {
  file: string,
  stats: ?Stats,
  isSymbolicLink: boolean,
};

export type FileSystemService = {

  /**
   * Copies a file to a new path.
   * @return true if the operation was successful; false if it wasn't.
   */
  copy(oldPath: string, newPath: string): Promise<boolean>,

  exists(path: string): Promise<boolean>,

  findNearestFile(fileName: string, pathToDirectory: string): Promise<?string>,

  /**
   * The lstat endpoint is the same as the stat endpoint except it will return
   * the stat of a link instead of the file the link points to.
   */
  lstat(path: string): Promise<Stats>,

  /**
   * Creates a new directory with the given path.
   * Throws EEXIST error if the directory already exists.
   * Throws ENOENT if the path given is nested in a non-existing directory.
   */
  mkdir(path: string): Promise<void>,

  /**
   * Runs the equivalent of `mkdir -p` with the given path.
   *
   * Like most implementations of mkdirp, if it fails, it is possible that
   * directories were created for some prefix of the given path.
   * @return true if the path was created; false if it already existed.
   */
  mkdirp(path: string): Promise<boolean>,

  /**
   * If no file (or directory) at the specified path exists, creates the parent
   * directories (if necessary) and then writes an empty file at the specified
   * path.
   *
   * @return A boolean indicating whether the file was created.
   */
  newFile(filePath: string): Promise<boolean>,

  /**
   * The readdir endpoint accepts the following query parameters:
   *
   *   path: path to the folder to list entries inside.
   *
   * Body contains a JSON encoded array of objects with file: and stats: entries.
   * file: has the file or directory name, stats: has the stats of the file/dir,
   * isSymbolicLink: true if the entry is a symlink to another filesystem location.
   */
  readdir(path: string): Promise<Array<FileWithStats>>,

  /**
   * Gets the real path of a file path.
   * It could be different than the given path if the file is a symlink
   * or exists in a symlinked directory.
   */
  realpath(path: string): Promise<string>,

  /**
   * Runs the equivalent of `mv sourcePath destinationPath`.
   */
  rename(sourcePath: string, destinationPath: string): Promise<void>,

  /**
   * Removes directories even if they are non-empty. Does not fail if the directory doesn't exist.
   */
  rmdir(path: string): Promise<void>,

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
  stat(path: string): Promise<Stats>,

  /**
   * Removes files. Does not fail if the file doesn't exist.
   */
  unlink(path: string): Promise<void>,

  /**
   *   path: the path to the file to read
   *   options: options to pass to fs.readFile.
   *      Note that options does NOT include 'encoding' this ensures that the return value
   *      is always a Buffer and never a string.
   *
   *   Callers who want a string should call buffer.toString('utf8').
   */
  readFile(path: string, options?: {flag?:string}):
      Promise<Buffer>,

  /**
   * The writeFile endpoint accepts the following query parameters:
   *
   *   path: path to the file to written.
   *   data: file contents to write.
   *   options: options to pass to fs.writeFile
   */
  writeFile(path: string, data: string,
      options: ?{encoding?: string, mode?: number, flag?:string}): Promise<void>,
};
