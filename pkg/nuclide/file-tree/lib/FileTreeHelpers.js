'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {
  Directory: LocalDirectory,
  File: LocalFile,
} = require('atom');
var {
  RemoteConnection,
  RemoteDirectory,
  RemoteFile,
} = require('nuclide-remote-connection');
var RemoteUri = require('nuclide-remote-uri');

var {parse} = require('nuclide-commons').url;
var pathModule = require('path');
var url = require('url');

type Directory = LocalDirectory | RemoteDirectory;
type File = LocalFile | RemoteFile;

function dirPathToKey(path: string): string {
  return path.replace(/\/+$/, '') + '/';
}

function isDirKey(key: string): boolean {
  return (key.slice(-1) === '/');
}

function keyToName(key: string): string {
  var path = keyToPath(key);
  var index = path.lastIndexOf('/');
  return (index === -1) ? path : path.slice(index + 1);
}

function keyToPath(key: string): string {
  return key.replace(/\/+$/, '');
}

function getParentKey(key: string): ?string {
  var path = keyToPath(key);
  var parsed = parse(path);
  parsed.pathname = pathModule.join(parsed.pathname, '..');
  var parentPath = url.format(parsed);
  return dirPathToKey(parentPath);
}

// The array this resolves to contains the `nodeKey` of each child
function fetchChildren(nodeKey: string): Promise<Array<string>> {
  var directory = getDirectoryByKey(nodeKey);
  return new Promise((resolve, reject) => {
    if (!directory) {
      // TODO: reject?
      resolve([]);
      return;
    }
    directory.getEntries((error, entries) => {
      // Resolve to an empty array if the directory deson't exist.
      // TODO: should we reject promise?
      if (error && error.code !== 'ENOENT') {
        reject(error);
        return;
      }
      entries = entries || [];
      var keys = entries.map(entry => {
        var path = entry.getPath();
        return entry.isDirectory() ? dirPathToKey(path) : path;
      });
      resolve(keys);
    });
  });
}

// TODO: cache these instantiated directories (also expose a way to purge)
function getDirectoryByKey(key: string): ?Directory {
  var path = keyToPath(key);
  if (RemoteUri.isRemote(path)) {
    var connection = RemoteConnection.getForUri(path);
    if (!connection) {
      return;
    }
    return new RemoteDirectory(connection, path);
  } else {
    return new LocalDirectory(path);
  }
}

// TODO: cache these instantiated entries (also expose a way to purge)
function getFileByKey(key: string): ?(Directory | File) {
  var path = keyToPath(key);
  if (RemoteUri.isRemote(path)) {
    var connection = RemoteConnection.getForUri(path);
    if (!connection) {
      return;
    }
    return isDirKey(key) ? new RemoteDirectory(connection, path) : new RemoteFile(connection, path);
  } else {
    return isDirKey(key) ? new LocalDirectory(path) : new LocalFile(path);
  }
}

// Sometimes remote directories are instantiated as local directories but with invalid paths.
function isValidDirectory(directory: Directory): boolean {
  return (!isLocalFile(directory) || isFullyQualifiedLocalPath(directory.getPath()));
}

function isLocalFile(entry: File | Directory): boolean {
  // TODO: implement `RemoteDirectory.isRemoteDirectory()`
  return !('getLocalPath' in entry);
}

function isFullyQualifiedLocalPath(path: string): boolean {
  return path.charAt(0) === '/';
}

function isContextClick(event: SyntheticMouseEvent): boolean {
  return (
    event.button === 2 ||
    (event.button === 0 && event.ctrlKey === true && process.platform === 'darwin')
  );
}

module.exports = {
  dirPathToKey,
  isDirKey,
  keyToName,
  keyToPath,
  getParentKey,
  fetchChildren,
  getDirectoryByKey,
  getFileByKey,
  isValidDirectory,
  isLocalFile,
  isFullyQualifiedLocalPath,
  isContextClick,
};
