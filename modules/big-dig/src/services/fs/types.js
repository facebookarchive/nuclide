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

// need thrift flow type
import filesystem_types from './gen-nodejs/filesystem_types';

export interface RemoteFileSystemClient {
  watch(path: string, options: filesystem_types.WatchOpt): Promise<void>;
  pollFileChanges(): Promise<any>;
  createDirectory(path: string): Promise<void>;
  stat(path: string): Promise<filesystem_types.FileStat>;
  readFile(path: string): Promise<Buffer>;
  writeFile(
    path: string,
    content: Buffer,
    options: filesystem_types.WriteFileOpt,
  ): Promise<void>;
  rename(
    oldUri: string,
    newUri: string,
    options: filesystem_types.RenameOpt,
  ): Promise<void>;
  copy(
    source: string,
    destination: string,
    options: filesystem_types.CopyOpt,
  ): Promise<void>;
  deletePath(uri: string, options: filesystem_types.DeleteOpt): Promise<void>;
  readDirectory(uri: string): Promise<Array<filesystem_types.FileEntry>>;
}
