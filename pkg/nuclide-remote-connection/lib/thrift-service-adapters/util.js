/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {DirectoryEntry} from '../../../nuclide-fs';

import fs from 'fs';
import nuclideUri from 'nuclide-commons/nuclideUri';
import filesystem_types from 'big-dig/src/services/fs/gen-nodejs/filesystem_types';

export class FallbackToRpcError extends Error {}
export class AccessArchiveError extends Error {}

export function rejectArchivePaths(uri: NuclideUri, operation: string) {
  if (nuclideUri.isInArchive(uri)) {
    throw new AccessArchiveError(
      `The '${operation}' operation does not support archive paths like '${uri}'`,
    );
  }
}

export function checkArchivePathsToFallbackToRpc(
  uri: NuclideUri,
  operation: string,
) {
  if (nuclideUri.isInArchive(uri)) {
    throw new FallbackToRpcError(
      `Unable to perform: ${operation} on archive file: ${uri}, fallback to use RPC method`,
    );
  }
}

export function convertToFsFileStat(stat: filesystem_types.FileStat): fs.Stats {
  const fileStat = new fs.Stats();
  fileStat.dev = stat.dev;
  fileStat.mode = stat.mode;
  fileStat.nlink = stat.nlink;
  fileStat.uid = stat.uid;
  fileStat.gid = stat.gid;
  fileStat.rdev = stat.rdev;
  fileStat.blksize = stat.blksize;
  fileStat.ino = stat.ino;
  fileStat.size = stat.size;
  fileStat.blocks = stat.blocks;
  fileStat.atime = new Date(stat.atime);
  fileStat.mtime = new Date(stat.mtime);
  fileStat.ctime = new Date(stat.ctime);
  fileStat.birthtime = new Date(stat.birthtime);

  return fileStat;
}

export function convertToFsDirectoryEntries(
  entries: Array<filesystem_types.FileEntry>,
): Array<DirectoryEntry> {
  return entries.map(entry => {
    const localName = entry.fname;
    const isFile = entry.ftype === filesystem_types.FileType.FILE;
    const isSymbolicLink = entry.ftype === filesystem_types.FileType.SYMLINK;
    return [localName, isFile, isSymbolicLink];
  });
}
