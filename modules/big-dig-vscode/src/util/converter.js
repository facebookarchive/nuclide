/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

/**
 * This file contains a series of converter functions that will be used by
 * `ThriftRemoteFileSystem` and `RemoteFileSystem`to convert data types
 *
 * Keep all those converter methods in one place for reusing code.
 */

import type {FsStatResult, FsWatchData} from 'big-dig-vscode-server/Protocol';

import * as vscode from 'vscode';
import {RpcMethodError} from '../ConnectionWrapper';
import {getLogger} from 'log4js';
import filesystem_types from 'big-dig/src/services/fs/gen-nodejs/filesystem_types';

const logger = getLogger('remote-fs');

export function createVSCodeFsError(
  error: any,
  uri?: vscode.Uri,
): vscode.FileSystemError {
  // TODO(T29077849): `instanceof` is not working
  if (
    error instanceof vscode.FileSystemError ||
    (typeof error.name === 'string' && error.name.includes('(FileSystemError)'))
  ) {
    return error;
  }
  if (error instanceof RpcMethodError && error.parameters.code) {
    switch (error.parameters.code) {
      case 'EEXIST':
        return vscode.FileSystemError.FileExists(uri || error.message);
      case 'EISDIR':
        return vscode.FileSystemError.FileIsADirectory(uri || error.message);
      case 'ENOENT':
        return vscode.FileSystemError.FileNotFound(uri || error.message);
      case 'ENOTDIR':
        return vscode.FileSystemError.FileNotADirectory(uri || error.message);
      case 'EACCES':
        return vscode.FileSystemError.NoPermissions(uri || error.message);
    }
  }
  logger.error(error);
  return new vscode.FileSystemError(error.toString());
}

export function convertToVSCodeFileStat(
  statData: filesystem_types.FileStat,
): vscode.FileStat {
  const {mtime, ctime, size} = statData;
  return {
    mtime: new Date(mtime).getTime(),
    ctime: new Date(ctime).getTime(),
    size,
    type: convertToVSCodeFileType(statData),
  };
}

/**
 * Functions used to convert a list of Thrift file change events to VSCode
 * FsWatchDatam, here FsWatchData = Array<FsWatchEntry>
 * According to remote file system Thrift file:
 *   FileChangeEventType {UNKNOWN = 1, ADD = 2, DELETE = 3, UPDATE = 4}
 * In VSCode, each Thrift file change event type will be mapped as:
 *   UNKNOWN -> 'u', ADD -> 'a', 'DELETE' -> 'd', 'UPDATE' -> 'u'
 * where, 'u': update, 'a': add, 'd': delete
 */
export function convertToVSCodeFileChangeEvents(
  changes: Array<filesystem_types.FileChangeEvent>,
): FsWatchData {
  const mapping = {'1': 'u', '2': 'a', '3': 'd', '4': 'u'};
  return changes.map(change => {
    return {path: change.fname, type: mapping[change.eventType]};
  });
}

export function convertToVSCodeFileType(
  data: filesystem_types.FileStat | filesystem_types.FileEntry,
): vscode.FileTypeType {
  const {ftype} = data;
  let type = null;
  if (ftype === filesystem_types.FileType.FILE) {
    type = vscode.FileType.File;
  } else if (ftype === filesystem_types.FileType.DIRECTORY) {
    type = vscode.FileType.Directory;
  } else if (ftype === filesystem_types.FileType.SYMLINK) {
    type = vscode.FileType.SymbolicLink;
  } else {
    type = vscode.FileType.Unknown;
  }
  return type;
}

export function toChangeType(ch: 'a' | 'd' | 'u'): vscode.FileChangeTypeType {
  switch (ch) {
    case 'a':
      return vscode.FileChangeType.Created;
    case 'd':
      return vscode.FileChangeType.Deleted;
    case 'u':
      return vscode.FileChangeType.Changed;
    default:
      logger.warn(`Unknown file change type ${ch}`);
      return vscode.FileChangeType.Changed;
  }
}

export function toFileType(stat: FsStatResult): vscode.FileTypeType {
  if (stat.isFile && stat.isDirectory) {
    logger.warn('Encountered a path that is both a file and directory.');
  }

  const flags = [
    stat.isFile ? vscode.FileType.File : 0,
    stat.isDirectory ? vscode.FileType.Directory : 0,
    stat.isSymlink ? vscode.FileType.SymbolicLink : 0,
  ] // eslint-disable-next-line no-bitwise
    .reduce((acc, f) => acc | f, 0);
  return ((flags: any): vscode.FileTypeType);
}

export function toStat(stat: FsStatResult): vscode.FileStat {
  const {mtime, ctime, size} = stat;
  return {mtime, ctime, size, type: toFileType(stat)};
}
